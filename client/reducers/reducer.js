const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ACCOUNTS':
      console.log('Adding an account...')
      return Object.assign({}, state, {
        loadAccounts: true
      })
    case 'ADD_DONE':
      console.log('Done adding an account')
      return Object.assign({}, state, {
        accounts: [...state.accounts, ...action.accounts],
        loadAccounts: false
      })
    default:
      return state
  }
}

module.exports = reducer
