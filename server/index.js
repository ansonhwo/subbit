'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const plaid = require('plaid')
const app = express()

const APP_PORT = process.env.APP_PORT || 9999
const { PLAID_CLIENT_ID, PLAID_SECRET } = process.env

const plaidClient = new plaid.Client(
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  plaid.environments.tartan
)

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())

// Get all accounts associated with the provided institution & provided credentials
app.post('/connect', ({ body }, res) => {
  console.log('POST /connect')
  const public_token = body.token

  // Exchange public token for a user access token
  plaidClient.exchangeToken(public_token, (err, tokenResponse) => {
    if (err !== null) res.json({ error: 'Unable to exchange public token' })
    else {
      // Successful token exchange
      // Store the resulting access token into the database
      const access_token = tokenResponse.access_token
      console.log(`access_token: ${access_token}`)

      plaidClient.getConnectUser(access_token, (err, authResponse) => {
        if (err !== null) res.json({ error: 'Unable to pull accounts from Plaid API' })
        else {
          console.log(authResponse)
          // Filter out sensitive information
          // Return all of the user accounts
          res.json({ accounts: authResponse.accounts, access_token })
        }
      })
    }
  })
})

// Get transactions for the provided user
app.post('/connect/get', ({ body }, res) => {
  console.log('POST /connect/get')
  const access_token = body.token
  console.log(body)

  plaidClient.getConnectUser(access_token, {}, (err, response) => {
    console.log(response.transactions)
    res.json({ transactions: response.transactions })
  })
})

const access_token = '18e05de266ef2c0436328e74634ddf91c3aa46f5e7f5ae9dd8a92a2ae4f9ef5c069ed155bfdbecc5ad0fa732b7be52cb8c38afb6a63e7eaee884abdf6234af39f8f460a0d96f46c5efa3e5f437ea8eb0'
plaidClient.getConnectUser(access_token, {}, (err, response) => {
  if (err !== null) {
    console.log(err)
    console.log('Could not retrieve auth user')
  }
  else {
    console.log('Auth user account details:')
    console.log(response.transactions)
  }
})
/**
plaidClient.getConnectUser('test_citi', {}, (err, response) => {
  if (err !== null) console.log('Could not retrieve auth test user')
  else {
    console.log('Auth test user account details:')
    console.log(response.transactions)
  }
})**/

app.listen(APP_PORT, () => console.log(`Listening on ${APP_PORT}`))
