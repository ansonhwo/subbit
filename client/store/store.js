const { createStore, applyMiddleware } = require('redux')
const thunk = require('redux-thunk').default
const reducer = require('../reducers/reducer.js')

const initialState = {
  accounts: [],
  institutions: [],
  loadAccounts: false,
  transactions: [],
  users: [],
  username: 'User',
  view: 'landing'
}

module.exports = createStore(reducer, initialState, applyMiddleware(thunk))
