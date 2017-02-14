'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const plaid = require('plaid')
const Cryptr = require('cryptr')
const moment = require('moment')
const knex = require('knex')({
  client: 'postgresql',
  connection: {
    user: 'super',
    database: 'subbit'
  }
})
const app = express()

const APP_PORT = process.env.APP_PORT || 9999
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
      if (!memberData) return { accounts: [], transactions: [], inst_name: null }

      // Encrypt access token
      const encrypt_token = cryptr.encrypt(memberData.access_token)

      // Insert access token into the database
      return knex('userdata')
        .insert({
          username,
          inst_id: inst_type,
          token: encrypt_token
        })
        .then(_ => {
          const formattedData = formatResponse(memberData, inst_name)
          formattedData.inst_name = inst_name
          return formattedData
        })
    })
    .then(formattedData => res.status(201).json(formattedData))
    .catch(err => res.sendStatus(404))

})

// Get user account and associated transaction information
app.post('/connect/get', ({ body }, res) => {

  const username = body.username

  // Get institution names for current user's information
  knex('institutions')
    .select('inst_name')
    .innerJoin('userdata', function() {
      this.on('userdata.inst_id', '=', 'institutions.inst_id')
    })
    .where('userdata.username', username)
    .then(instList => {
      if (!instList.length) return []

      return instList.map(inst => inst.inst_name)
    })
    .then(inst_names => {
      if (!inst_names.length) return { transactions: [], accounts: [], inst_names: [] }

      // Checking if the current user has any previously registered accounts
      return knex('userdata')
        .select('token')
        .where('username', username)
        .then(tokenList => {

          const tokens = tokenList.map(item => item.token)

          // If no registered accounts, return nothing
          if (!tokens.length) return { transactions: [], accounts: [], inst_names: [] }

          // Registered accounts found, return account & transaction information
          // for all registered accounts
          return Promise.all(tokens.map(token => {
            return getMemberData(cryptr.decrypt(token))
          }))
            // Filter out irrelevant information
            .then(responses => {
              return responses.map((response, index) => {
                return formatResponse(response, inst_names[index])
              })
            })
            // Build a new object with the formatted information
            .then(responses => {
                const formattedResponses = responses.reduce((obj, data) => {
                  obj.accounts = [...obj.accounts, ...data.accounts]
                  obj.transactions = [...obj.transactions, ...data.transactions]
                  return obj
                }, { transactions: [], accounts: [] })

                formattedResponses.inst_names = inst_names

                return formattedResponses
            })

        })
    })
    .then(result => {
      res.status(201).json(result)
    })

})

// Sandbox Testing
// //const access_token = '18e05de266ef2c0436328e74634ddf91c3aa46f5e7f5ae9dd8a92a2ae4f9ef5c069ed155bfdbecc5ad0fa732b7be52cb8c38afb6a63e7eaee884abdf6234af39f8f460a0d96f46c5efa3e5f437ea8eb0'
// const access_token = 'test_chase'
// //
// // // When grabbing transactions, always need to return
// // // # of months desired + 1
// // // e.g. Four months of history = Five months of transactions
// //plaidClient.getConnectUser(access_token, { gte: '150 days ago'}, (err, response) => {
// plaidClient.getConnectUser(access_token, {}, (err, response) => {
//   if (err) console.error(err)
//   else {
//     let { transactions } = formatResponse(response)
//     const ignore = [
//       'Arts and Entertainment',
//       'ATM',
//       'Bank Fees',
//       'Credit Card',
//       'Deposit',
//       'Digital Purchase',
//       'Food and Drink',
//       'Groceries',
//       'Gas Stations',
//       'Government Departments and Agencies',
//       'Payroll',
//       'Restaurants',
//       'Shops',
//       'Supermarkets and Groceries',
//       'Transfer',
//       'Travel'
//     ]
//
//     // Sort transactions by date descending, and filter out transactions
//     // that have a non-zero negative amount & lie within ignored categories
//     transactions = transactions.slice()
//       .sort((a, b) => {
//         return moment(a.date, 'YYYY-MM-DD').diff(moment(b.date, 'YYYY-MM-DD'), 'days') >= 0 ? -1 : 1
//       })
//       .filter(transaction => {
//         let check = transaction.category.filter(category => {
//           return ignore.includes(category)
//         })
//         return transaction.amount >= 0 && !check.length ? true : false
//       })
//
//     // Iterate through all of the transactions (by month)
//     // Get the index ranges of all transactions in the same month and year
//     // Return an array of arrays grouped by month and year
//     let increment = 1
//     const monthsByYear = []
//     const transactionsByMonth = []
//
//     for (let start = 0; start < transactions.length; start += increment) {
//
//       let end = -1
//       let monthAndYear = moment(transactions[start].date, 'YYYY-MM-DD').format('MMMM YYYY')
//       monthsByYear.push(monthAndYear)
//
//       // Check for the next instance of a differing month and year
//       for (let check = start + 1; check < transactions.length; check++) {
//         if (moment(transactions[check].date, 'YYYY-MM-DD').format('MMMM YYYY') !== monthAndYear) {
//           end = check
//           break
//         }
//       }
//
//       if (end >= 1) {
//         transactionsByMonth.push(transactions.slice(start, end))
//         increment = end - start
//       }
//       else {
//         transactionsByMonth.push(transactions.slice(start, transactions.length))
//         start = transactions.length
//       }
//
//     }
//     console.log('\nDone sorting transactions')
//     console.log('transactions by month:')
//     console.log(JSON.stringify(transactionsByMonth, null, 2))
//     console.log('months by year:')
//     console.log(monthsByYear)
//   }
// })

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
function formatAccounts(accounts, inst_name) {
  return accounts.map(account => {
    return {
      balance: account.balance.current,
      inst_name,
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
function formatResponse(response, inst_name) {
  return {
    accounts: formatAccounts(response.accounts, inst_name),
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

app.listen(APP_PORT, () => console.log(`Listening on ${APP_PORT}`))
