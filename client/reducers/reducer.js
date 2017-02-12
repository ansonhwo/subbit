const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ACCOUNTS':
      console.log('adding accounts')
      return Object.assign({}, state, {
        loadAccounts: true
      })
    case 'ADD_DONE':
      console.log('done loading accounts')
      return Object.assign({}, state, {
        loadAccounts: false
      })
    case 'ADD_MEMBERDATA':
      return Object.assign({}, state, {
        accounts: [...state.accounts, ...action.memberData.accounts],
        transactions: [...state.transactions, ...action.memberData.transactions],
        institutions: [...state.institutions, action.memberData.inst_name]
      })
    case 'CHANGE_USER':
      return Object.assign({}, state, {
        username: action.username
      })
    case 'CHANGE_VIEW':
      return Object.assign({}, state, {
        view: action.view
      })
    case 'GET_MEMBERDATA':
      return Object.assign({}, state, {
        accounts: action.memberData.accounts,
        transactions: action.memberData.transactions,
        institutions: action.memberData.inst_names
      })
    case 'GET_USERS':
      return Object.assign({}, state, {
        users: action.users
      })
    default:
      return state
  }
}

module.exports = reducer
