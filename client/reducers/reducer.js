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
      console.log(`Changing active user to ${action.username}`)
      return Object.assign({}, state, {
        username: action.username
      })
    case 'CHANGE_VIEW':
      console.log(`Changing view status to ${action.view}`)
      return Object.assign({}, state, {
        view: action.view
      })
    case 'GET_MEMBERDATA':
      console.log('Member data update')
      console.log(action.memberData)
      return Object.assign({}, state, {
        accounts: memberData.accounts,
        transactions: memberData.transactions
      })
    case 'GET_USERS':
      console.log('Populating users list')
      return Object.assign({}, state, {
        users: action.users
      })
    default:
      return state
  }
}

module.exports = reducer
