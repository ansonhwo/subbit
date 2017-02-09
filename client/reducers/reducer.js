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
    case 'CHANGE_USER':
      console.log('Changing active user')
      return Object.assign({}, state, {
        username: action.user
      })
    case 'CHANGE_VIEW':
      console.log(`Changing view status to ${action.view}`)
      return Object.assign({}, state, {
        view: action.view
      })
    default:
      return state
  }
}

module.exports = reducer
