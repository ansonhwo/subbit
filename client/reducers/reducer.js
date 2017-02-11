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
        loadAccounts: false
      })
    case 'ADD_MEMBERDATA':
      console.log('Appending member data')
      return Object.assign({}, state, {
        accounts: [...state.accounts, ...action.memberData.accounts],
        transactions: [...state.transactions, ...action.memberData.transactions]
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
      console.log('Getting member data')
      console.log(action.memberData)
      return Object.assign({}, state, {
        accounts: action.memberData.accounts,
        transactions: action.memberData.transactions,
        institutions: action.memberData.inst_names
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
