'use strict'

/**
client_id: 5895125cbdc6a41dfd904590
public_key: a1430f4f27921e4c6bdf5f37edfcfa
secret: 798c97303f8c1ffdb8f625c6d1626c
connect user: 18e05de266ef2c0436328e74634ddf91c3aa46f5e7f5ae9dd8a92a2ae4f9ef5c069ed155bfdbecc5ad0fa732b7be52cb8c38afb6a63e7eaee884abdf6234af39f8f460a0d96f46c5efa3e5f437ea8eb0

test client: test_id
test secret: test_secret
test access: test_chase, test_wells, test_citi, etc.

**/

const express = require('express')
const bodyParser = require('body-parser')
const plaid = require('plaid')
//const Cryptr = require('cryptr')
const knex = require('knex')({
  client: 'postgresql',
  connection: {
    user: 'super',
    database: 'subbit'
  }
})
const app = express()

const APP_PORT = process.env.APP_PORT || 9999
const { PLAID_CLIENT_ID, PLAID_SECRET } = process.env

const plaidClient = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  plaid.environments.tartan
)

//const cryptr = new Cryptr(PLAID_SECRET)

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())

// Get a list of all the users
app.get('/users', (req, res) => {
  console.log('GET /users')
  knex('users')
    .select('username')
    .then(users => {
      const usernames = users.map(user => {
        return user.username
      })
      res.json(usernames)
    })
    .catch(err => res.sendStatus(404))
})

// Add new account credentials for a user
app.put('/connect', ({ body }, res) => {
  console.log('POST /connect')
  const { token, institution, username } = body
  console.log({ token, institution, username })

  knex('users')
    .select('inst_ids', 'tokens')
    .where('username', username)
    .then(([ user ]) => {
      console.log('result from DB call:')
      console.log(user)
      const { inst_ids, tokens } = user
      const member = { inst_ids, tokens, found: false }

      // Check if the user has already added an account for the provided institution
      if (inst_ids.length && inst_ids.includes(institution)) member.found = true

      return member
    })
    .then(member => {
      // User has already registered with the provided institution
      if (member.found) return []

      return exchangeToken(token)
        .then(authResponse => {
          return Object.assign({}, authResponse, member)
        })

        /**
        .then(accountData => {
          console.log('\n\nAccount Data')
          console.log(accountData)

          return formatResponse(accountData)

          console.log('Appending new inst_id and access_token to object')
          // Update the inst_ids and tokens associated with the current user
          member.inst_ids.push(institution)
          member.tokens.push(accountData.access_token)

          console.log('Updating inst_ids and tokens in users table')
          return knex('users')
            .update({
              inst_ids: member.inst_ids,
              tokens: member.tokens
            })
            .where('username', username)
            .then(_ => formatResponse(accountData))**/


          /**return knex('users')
            .update({
              inst_ids: member.inst_ids,
              tokens: member.tokens
            })
            .where('username', username)
            // Filter out irrelevant information
            .then(_ => {
              console.log('Formatting the response...')
              return formatResponse(accountData)
            })
            // Return formatted member data
            .then(formattedData => {
              console.log('\n\nreturning massive data object')
              console.log(formattedData)
              return formattedData
            })
        })**/
    })
    .then(accountData => {
      console.log('\n\nAccount Data')
      console.log(accountData)

      console.log('updating users table with inst_id & token')
      return knex('users')
        .update({
          inst_ids: accountData.inst_ids,
          tokens: accountData.tokens
        })
        .where('username', username)
        .then(_ => {
          console.log('formatting response...')
          return formatResponse(accountData)
        })
      //console.log('Formatting response data...')
      //return formatResponse(accountData)
    })
    .then(formattedData => {
      console.log('\n\nFormatted Data:')
      console.log(formattedData)
      res.status(201).json(formattedData)
    })
    .catch(err => {
      console.log('something went terribly wrong........... :(')
      res.sendStatus(404)
    })

})
    /**
    .then(formattedData => {
      console.log('Appending new inst_id and access_token to object')
      // Update the inst_ids and tokens associated with the current user
      member.inst_ids.push(institution)
      member.tokens.push(accountData.access_token)

      console.log('Updating inst_ids and tokens in users table')
      return knex('users')
        .update({
          inst_ids: member.inst_ids,
          tokens: member.tokens
        })
        .where('username', username)
        .then(_ => formatResponse(accountData))

    })
    .then(member => {
      console.log('\nShould be sending a response back now...')
      console.log('Response:')
      console.log(member)
      res.status(201).json(member)
    })

})**/

// Get user account and associated transaction information
app.post('/connect/get', ({ body }, res) => {
  console.log('POST /connect/get')
  const username = body.username

  // Checking if the current user has any previously registered accounts
  knex('users')
    .select('tokens')
    .where('username', username)
    .then(res => {

      const tokens = res[0].tokens
      let transactions = [], accounts = []

      // If no registered accounts, return nothing
      if (!tokens.length) return []

      // Registered accounts found, return account & transaction information
      // for all registered accounts
      return Promise.all(tokens.map(token => {
        return getMemberData(token)
      }))
        // Filter out irrelevant information
        .then(responses => {
          return responses.map(formatResponse)
        })
        // Build a new object with the formatted information
        .then(responses => responses.reduce((obj, data) => {
          obj.accounts = [...obj.accounts, ...data.accounts]
          obj.transactions = [...obj.transactions, ...data.transactions]
          return obj
        }, { transactions, accounts }))

    })
    .then(result => res.json(result))
})

// Need a route to handle access token deletion

// API Testing for account transactions
//const access_token = '18e05de266ef2c0436328e74634ddf91c3aa46f5e7f5ae9dd8a92a2ae4f9ef5c069ed155bfdbecc5ad0fa732b7be52cb8c38afb6a63e7eaee884abdf6234af39f8f460a0d96f46c5efa3e5f437ea8eb0'
// const access_token = 'test_chase'
// plaidClient.getConnectUser(access_token, {}, (err, response) => {
//   if (err !== null) {
//     console.log(err)
//     console.log('Could not retrieve auth user')
//   }
//   else {
//     // Accounts: response.accounts, Transactions: response.transactions
//     console.log('Auth user account details:')
//     console.log(JSON.stringify(response, null, 2))
//   }
// })

// API Testing for checking for existing accounts
// let username = 'test2'
// let institution = 'test_chase'
// knex('users')
//   .select('inst_ids', 'tokens')
//   .where('username', username)
//   .then(([ user ]) => {
//     const { inst_ids, tokens } = user
//     const member = { inst_ids, tokens, found: false }
//     if (inst_ids.length && inst_ids.includes(institution)) member.found = true
//
//     return member
//   })

// Token encryption
/**
console.log(cryptr)

const encrypted = cryptr.encrypt('18e05de266ef2c0436328e74634ddf91c3aa46f5e7f5ae9dd8a92a2ae4f9ef5c069ed155bfdbecc5ad0fa732b7be52cb8c38afb6a63e7eaee884abdf6234af39f8f460a0d96f46c5efa3e5f437ea8eb0')
const decrypted = cryptr.decrypt(encrypted)

console.log(encrypted)
console.log(decrypted)**/

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
function formatAccounts(accounts) {
  return accounts.map(account => {
    return {
      balance: account.balance.current,
      number: account.meta.number,
      type: account.type,
      institution_type: account.institution_type
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
        date: transaction.date,
        name: transaction.name
      }
    })
}

// Format response objects with relevant information
function formatResponse(response) {
  return {
    accounts: formatAccounts(response.accounts),
    transactions: formatTransactions(response.transactions)
  }
}

// Exchange public token for an access token
function exchangeToken(public_token) {
  console.log('\tfunction exchangeToken')
  return new Promise((resolve, reject) => {
    plaidClient.exchangeToken(public_token, (err, tokenResponse) => {
      console.log('\t\texchanging token...')
      if (err) reject(err)
      else {
        console.log('\t\tsuccessful token exchange!')
        // Successful token exchange
        const access_token = tokenResponse.access_token

        plaidClient.getConnectUser(access_token, (err, authResponse) => {
          console.log('\t\t\tpulling accounts from API...')
          if (err) reject(err)
          else {
            console.log('\t\t\tsuccessfully pulled account info!')
            // Return all of the account and transaction information
            resolve(authResponse)
          }
        })
      }
    })
  })
}

app.listen(APP_PORT, () => console.log(`Listening on ${APP_PORT}`))
