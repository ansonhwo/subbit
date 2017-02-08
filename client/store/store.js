const { createStore, applyMiddleware } = require('redux')
const thunk = require('redux-thunk').default
const reducer = require('../reducers/reducer.js')

const initialState = {
  accounts: [],
  loadAccounts: false
}

module.exports = createStore(reducer, initialState, applyMiddleware(thunk))
