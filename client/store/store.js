const { createStore, applyMiddleware } = require('redux')
const thunk = require('redux-thunk').default
const reducer = require('../reducers/reducer.js')

const initialState = {
  accounts: [],
  transactions: [],
  loadAccounts: false,
  users: ['test1', 'test2'],
  username: '',
  view: 'login'
}

module.exports = createStore(reducer, initialState, applyMiddleware(thunk))
