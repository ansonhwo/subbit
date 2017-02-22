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
        institutions: [...state.institutions, action.memberData.institution]
      })
    case 'CHANGE_MEMBER_VIEW':
      return Object.assign({}, state, {
        memberView: action.memberView
      })
    case 'CHANGE_TRANSACTION_VIEW':
      return Object.assign({}, state, {
        transactionView: action.transactionView
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
        institutions: action.memberData.institutions
      })
    case 'GET_TRANSACTION_DETAILS':
      return Object.assign({}, state, {
        transactionDetails: action.transactionDetails
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
    case 'TOGGLE_ACCOUNTS':
      return Object.assign({}, state, {
        institutions: action.institutions
      })
    default:
      return state
  }
}

module.exports = reducer
