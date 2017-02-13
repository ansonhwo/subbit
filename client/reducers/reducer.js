const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ACCOUNTS':
      return Object.assign({}, state, {
        loadAccounts: true
      })
    case 'ADD_DONE':
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
    case 'SORT_TRANSACTIONS':
      if (!action.doneSorting) {
        return Object.assign({}, state, {
          doneSorting: action.doneSorting
        })
      }
      else {
        return Object.assign({}, state, {
          doneSorting: action.doneSorting,
          monthsByYear: action.monthsByYear,
          transactionsByMonth: action.transactionsByMonth
        })
      }
    default:
      return state
  }
}

module.exports = reducer
