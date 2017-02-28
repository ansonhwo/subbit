'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const moment = require('moment')
const plaid = require('plaid')
const Cryptr = require('cryptr')

let knex
if (process.env.DATABASE_URL) {
  // Production database
  knex = require('knex')({
    client: 'postgresql',
    connection: process.env.DATABASE_URL
  })
}
else {
  // Development database
  knex = require('knex')({
    client: 'postgresql',
    connection: {
      user: 'super',
      database: 'subbit'
    }
  })
}

const app = express()

const PORT = process.env.PORT || 9999
const { PLAID_CLIENT_ID, PLAID_SECRET, CRYPTR_SECRET } = process.env

const plaidClient = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  plaid.environments.tartan
)

const cryptr = new Cryptr(CRYPTR_SECRET)

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())

// Exporting server config for testing
module.exports = app

// Get a list of all the users
app.get('/users', (req, res) => {

  knex('users')
    .select('username')
    .then(users => {
      const usernames = users.map(user => {
        return user.username
      })
      res.status(200).json(usernames)
    })
    .catch(err => res.sendStatus(404))

})

// Add new account credentials for a user
app.post('/connect', ({ body }, res) => {

  const { token, inst_name, inst_type, username } = body

  knex('institutions')
    .select('inst_id')
    .where('inst_id', inst_type)
    .then(instId => {
      // Check if the provided institution already exists
      if (!instId.length) return false
      else return true
    })
    .then(institution => {
      // Add a new institution type if it doesn't already exist
      if (institution) return null

      return knex('institutions')
        .insert({
          inst_id: inst_type,
          inst_name
        })
        .then(_ => null)
    })
    .then(_ => {
      // Check what accounts the user has already linked
      return knex('userdata')
        .select('inst_id')
        .where({
          username,
          inst_id: inst_type
        })
        .then(userData => {
          // Has the user already registered an account with the provided institution?
          if (!userData.length) return false
          else return true
        })
    })
    .then(registered => {
      // User has already registered with the provided institution
      if (registered) return false

      // Get an access token from the Plaid API
      return exchangeToken(token)
        .then(authResponse => {
          return authResponse
        })
    })
    .then(memberData => {
      // User has already registered, no need to add account info
      if (!memberData) return { accounts: [], transactions: [], institutions: [], monthsByYear: [] }

      // Encrypt access token
      const encrypt_token = cryptr.encrypt(memberData.access_token)

      // Insert access token into the database
      return knex('userdata')
        .insert({
          username,
          inst_id: inst_type,
          token: encrypt_token
        })
        .then(_ => formattedMemberData(username))
    })
    .then(formattedData => res.status(201).json(formattedData))
    .catch(err => res.sendStatus(404))

})

// Get user account and associated transaction information
app.post('/connect/get', ({ body }, res) => {

  const username = body.username

  formattedMemberData(username)
    .then(result => res.status(201).json(result))
    .catch(err => res.sendStatus(404))

})

app.delete('/connect/:username/:inst_ids', (req, res) => {
  const { username, inst_ids } = req.params
  const instList = inst_ids.split('+')

  knex.del()
    .from('userdata')
    .whereIn('inst_id', instList)
    .andWhere('username', username)
    .then(_ => formattedMemberData(username))
    .then(result => res.status(200).json(result))
    .catch(err => res.sendStatus(404))
})

// Return formatted account and transaction information for all user accounts
function formattedMemberData(username) {

  return new Promise((resolve, reject) => {
    // Get institution names for current user's information
    knex.select(knex.raw('i.inst_name, i.inst_id'))
      .from(knex.raw('institutions as i'))
      .innerJoin('userdata', function() {
        this.on(knex.raw('userdata.inst_id = i.inst_id'))
      })
      .where('userdata.username', username)
      .then(instList => {
        if (!instList.length) return []

        return instList.map(inst => {
          return {
            checked: false,
            inst_name: inst.inst_name,
            inst_id: inst.inst_id
          }
        })
      })
      .then(instList => {
        if (!instList.length) resolve({ transactions: [], accounts: [], institutions: [], monthsByYear: [] })

        // Checking if the current user has any previously registered accounts
        return knex('userdata')
          .select('token')
          .where('username', username)
          .then(tokenList => {

            const tokens = tokenList.map(item => item.token)

            // If no registered accounts, return nothing
            if (!tokens.length) resolve({ transactions: [], accounts: [], institutions: [], monthsByYear: [] })

            // Registered accounts found, return account & transaction information
            // for all registered accounts
            return Promise.all(tokens.map(token => {
              return getMemberData(cryptr.decrypt(token))
            }))
              // Filter out irrelevant information
              .then(responses => {
                return responses.map((response, index) => {
                  return formatResponse(response, instList[index])
                })
              })
              // Build a new object with the formatted information
              .then(responses => {
                  const formattedResponses = responses.reduce((obj, data) => {
                    obj.accounts = [...obj.accounts, ...data.accounts]
                    obj.transactions = [...obj.transactions, ...data.transactions]
                    return obj
                  }, { transactions: [], accounts: [] })
                  const { filteredTransactions, monthsByYear } = sortTransactions(formattedResponses.transactions)

                  formattedResponses.institutions = instList
                  formattedResponses.transactions = filteredTransactions
                  formattedResponses.monthsByYear = monthsByYear

                  resolve(formattedResponses)
              })

          })
      })
      .catch(err => reject(err))
  })

}

// Sort transactions chronologically and filter by amount & category
const sortTransactions = (unsorted) => {

  // Transaction categories to ignore
  const ignore = [
    'Arts and Entertainment',
    'ATM',
    'Bank Fees',
    'Credit Card',
    'Deposit',
    'Food and Drink',
    'Groceries',
    'Gas Stations',
    'Government Departments and Agencies',
    'Interest',
    'Payroll',
    'Restaurants',
    'Running',
    'Shops',
    'Stadiums and Arenas',
    'Supermarkets and Groceries',
    'Tax',
    'Third Party',
    'Travel',
    'Withdrawal'
  ]

  // Sort transactions by date descending
  const transactions = unsorted.slice()
    .sort((a, b) => {
      return moment(a.date, 'YYYY-MM-DD').diff(moment(b.date, 'YYYY-MM-DD'), 'days') >= 0 ? -1 : 1
    })

  // Iterate through all of the transactions (by month)
  // Get the index ranges of all transactions in the same month and year
  // Build an array of arrays grouped by month and year, date descending
  let increment = 1
  const monthsByYear = []
  const transactionsByMonth = []

  for (let start = 0; start < transactions.length; start += increment) {

    let end = -1
    let monthAndYear = moment(transactions[start].date, 'YYYY-MM-DD').format('MMMM YYYY')
    monthsByYear.push(monthAndYear)

    // Check for the next instance of a differing month and year
    for (let check = start + 1; check < transactions.length; check++) {
      if (moment(transactions[check].date, 'YYYY-MM-DD').format('MMMM YYYY') !== monthAndYear) {
        end = check
        break
      }
    }

    // If there are still more transactions, check the rest
    if (end >= 1) {
      transactionsByMonth.push(transactions.slice(start, end))
      increment = end - start
    }
    else {
      transactionsByMonth.push(transactions.slice(start, transactions.length))
      start = transactions.length
    }

  }

  // Map through all monthly transactions and check for reoccurrance
  const filteredTransactions = transactionsByMonth.map((transactionsForTheMonth, index) => {

    const filtered = transactionsForTheMonth.filter(thisMonthsTransaction => {

      // Filter out transactions that have a non-zero negative amount & lie within ignored categories
      if (thisMonthsTransaction.amount < 0 ||
            thisMonthsTransaction.category.filter(category => ignore.includes(category)).length) {
        return false
      }

      // 4 day buffer
      const lastDateLowerBound = -34
      const lastDateUpperBound = -26
      const nextDateLowerBound = 26
      const nextDateUpperBound = 34

      const nameCheck = thisMonthsTransaction.name.split(' ').slice(0, 2).join(' ')

      if (index < transactionsByMonth.length - 1) {
        // Check for identical transactions in the month prior
        const lastMonthsTransactions = transactionsByMonth[index + 1]
        for (let lastIndex = 0; lastIndex < lastMonthsTransactions.length; lastIndex++) {
          let foundDate = moment(lastMonthsTransactions[lastIndex].date, 'YYYY-MM-DD').diff(thisMonthsTransaction.date, 'days')

          if (lastMonthsTransactions[lastIndex].name.includes(nameCheck) &&
                foundDate >= lastDateLowerBound &&
                foundDate <= lastDateUpperBound) {
            return true
          }
        }
      }

      if (index > 0) {
        // Check for identical transactions in the month ahead
        const nextMonthsTransactions = transactionsByMonth[index - 1]
        for (let nextIndex = 0; nextIndex < nextMonthsTransactions.length; nextIndex++) {
          let foundDate = moment(nextMonthsTransactions[nextIndex].date, 'YYYY-MM-DD').diff(thisMonthsTransaction.date, 'days')

          if (nextMonthsTransactions[nextIndex].name.includes(nameCheck) &&
                foundDate >= nextDateLowerBound &&
                foundDate <= nextDateUpperBound) {
            return true
          }
        }
      }

      return false
    })

    return filtered

  })

  return { filteredTransactions, monthsByYear }

}

// Asynchronously fetch a series of account details for a collection of tokens
function getMemberData(token) {
  return new Promise((resolve, reject) => {
    plaidClient.getConnectUser(token, {}, (err, response) => {
      if (err) reject(err)
      else resolve(response)
    })
  })
}

// Format account objects with relevant information
function formatAccounts(accounts, institution) {
  return accounts.map(account => {
    return {
      balance: account.balance.current,
      inst_name: institution.inst_name,
      inst_id: institution.inst_id,
      name: account.meta.name,
      number: account.meta.number,
      type: account.type,
    }
  })
}

// Format transaction objects with relevant information
function formatTransactions(transactions) {
  return transactions.filter(transaction => {
    return !transaction.pending
  })
    .map(transaction => {
      return {
        amount: transaction.amount,
        category: transaction.category || ['Misc'],
        date: transaction.date,
        name: transaction.name
      }
    })
}

// Format response objects with relevant information
function formatResponse(response, institution) {
  return {
    accounts: formatAccounts(response.accounts, institution),
    transactions: formatTransactions(response.transactions)
  }
}

// Exchange public token for an access token
function exchangeToken(public_token) {

  return new Promise((resolve, reject) => {
    plaidClient.exchangeToken(public_token, (err, tokenResponse) => {
      if (err) reject(err)
      else {
        // Successful token exchange
        const access_token = tokenResponse.access_token

        plaidClient.getConnectUser(access_token, (err, authResponse) => {
          if (err) reject(err)
          else {
            // Return all of the account and transaction information
            resolve(authResponse)
          }
        })
      }
    })
  })
}

app.listen(PORT, () => console.log(`Listening on ${PORT}`))
