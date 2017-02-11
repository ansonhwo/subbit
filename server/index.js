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
//const request = require('request')
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

  console.log('PUT /connect')
  const { token, inst_name, inst_type, username } = body
  console.log(`token: ${token}\ninst_name: ${inst_name}\ninst_type: ${inst_type}\nusername: ${username}`)

  knex('institutions')
    .select('inst_id')
    .where('inst_id', inst_type)
    .then(instId => {
      console.log('check institutions table')
      console.log(instId)
      // Check if the provided institution already exists
      if (!instId.length) return false
      else return true
    })
    .then(institution => {
      console.log(`institution exists? ${institution}`)
      // Add a new institution type if it doesn't already exist
      if (institution) return null

      console.log('add new institution type & name')
      return knex('institutions')
        .insert({
          inst_id: inst_type,
          inst_name
        })
        .then(_ => null)
    })
    .then(_ => {
      console.log('query userdata table to see what accounts have been linked')
      // Check what accounts the user has already linked
      return knex('userdata')
        .select('inst_id')
        .where({
          username,
          inst_id: inst_type
        })
        .then(userData => {
          console.log(`has the user already registered an account at ${inst_name}?`)
          // Has the user already registered an account with the provided institution?
          if (!userData.length) return false

          else return true
        })
    })
    .then(registered => {
      // User has already registered with the provided institution
      console.log(`user is registered? ${registered}`)
      if (registered) return false

      console.log('nope, get access token')
      // Get an access token from the Plaid API
      return exchangeToken(token)
        .then(authResponse => {
          console.log('\n\ngot auth response:')
          console.log(authResponse)
          return authResponse
        })
    })
    .then(memberData => {
      console.log('\nAccount data:')
      console.log(memberData)
      // User has already registered, no need to add account info
      if (!memberData) return { accounts: [], transactions: [] }

      console.log('insert access token into userdata table')

      return knex('userdata')
        .insert({
          username,
          inst_id: inst_type,
          token: memberData.access_token
        })
        .then(_ => formatResponse(memberData, inst_name))
    })
    .then(formattedData => {
      console.log('\n\nFormatted Data:')
      console.log(formattedData)
      res.status(201).json(formattedData)
    })
    .catch(err => res.sendStatus(404))

})

// Get user account and associated transaction information
app.post('/connect/get', ({ body }, res) => {

  console.log('POST /connect/get')
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
      // Checking if the current user has any previously registered accounts
      return knex('userdata')
        .select('token')
        .where('username', username)
        .then(tokenList => {

          const tokens = tokenList.map(item => item.token)

          // If no registered accounts, return nothing
          if (!tokens.length) return { transactions: [], accounts: [] }

          // Registered accounts found, return account & transaction information
          // for all registered accounts
          return Promise.all(tokens.map(token => {
            return getMemberData(token)
          }))
            // Filter out irrelevant information
            .then(responses => {
              //console.log(JSON.stringify(responses, null, 2))
              //console.log(`responses map: inst_name: ${inst_name}`)
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
      console.log('\n\nPre-existing user account information:')
      console.log(result)
      res.json(result)
    })



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
//     console.log(JSON.stringify(response.accounts, null, 2))
//     //const temp = formatResponse(response)
//     //console.log(JSON.stringify(temp.accounts, null, 2))
//   }
// })

// All institutions
// plaidClient.getAllInstitutions({}, (err, response) => {
//   if (err) console.log(err)
//   else {
//     console.log('All institutions:')
//     console.log(JSON.stringify(response, null, 2))
//   }
// })

// **** Institutions by type?
// Client sends over institution_type in request body
// Append type to API request url
// Return actual name of institution
// const options = { json: true }
// request('https://tartan.plaid.com/institutions/all/bofa', options, (err, res, body) => {
//   if (err) console.error(err)
//   else console.log(body)
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

// Foreign key testing
// knex('institutions')
//   .select('inst_id')
//   .then(instIds => {
//     console.log('all institution ids:')
//     console.log(instIds)
//   })

// Knex testing
// knex('institutions')
//   .select('inst_name')
//   .innerJoin('userdata', function() {
//     this.on('userdata.inst_id', '=', 'institutions.inst_id')
//   })
//   .where('userdata.username', 'test1')
//   .then(inst_names => {
//     console.log(inst_names)
//   })

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
