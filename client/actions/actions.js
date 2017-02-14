const store = require('../store/store.js')

const addMemberData = (memberData) => {
  return { type: 'ADD_MEMBERDATA', memberData }
}

const changeUser = (username) => {
  return { type: 'CHANGE_USER', username }
}

const changeView = (view) => {
  return { type: 'CHANGE_VIEW', view }
}

const getMemberData = (memberData) => {
  return { type: 'GET_MEMBERDATA', memberData }
}

const getUsers = (users) => {
  return { type: 'GET_USERS', users }
}

const linkAccount = () => {
  return { type: 'ADD_ACCOUNTS' }
}

const linkDone = () => {
  return { type: 'ADD_DONE', accounts: [] }
}

const sortingTransStart = () => {
  return { type: 'SORT_TRANSACTIONS', doneSorting: false }
}

const sortingTransEnd = (transactionsByMonth, monthsByYear) => {
  return { type: 'SORT_TRANSACTIONS', transactionsByMonth, monthsByYear, doneSorting: true }
}

const fetchUsers = () => (dispatch) => {
  fetch('/users')
    .then(res => res.json())
    .then(res => dispatch(getUsers(res)))
    .catch(err => console.error(err))
}

const fetchAccounts = (username) => (dispatch) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username })
  }
  fetch('/connect/get', options)
    .then(res => res.json())
    .then(res => {
      dispatch(sortingTransStart())
      dispatch(getMemberData(res))
      dispatch(sortTransactions(store.getState().transactions))
    })
    .catch(err => console.error(err))
}


// Need to sort all of the transactions in the store by date first
// todo: filter out negative transactions and transactions that fall within
//  categories to ignore in 2017
const sortTransactions = (unsorted) => dispatch => {
  const monthsByYear = []
  const transactionsByMonth = []
  let transactions = unsorted.slice()

  transactions = transactions.sort((a, b) => {
     return moment(a.date, 'YYYY-MM-DD').diff(moment(b.date, 'YYYY-MM-DD'), 'days') >= 0 ? -1 : 1
  })

  // Iterate through all of the transactions (by month)
  // Get the index ranges of all transactions in the same month and year
  // Return an array of arrays grouped by month and year
  for (let start = 0; start < transactions.length; start += increment) {

    let end = -1
    let monthAndYear = moment(transactions[start].date, 'YYYY-MM-DD').format('MMMM YYYY')
    monthsByYear.push(monthAndYear)

    // Check for the next instance of a differing month and year
    for (let check = start + 1; check < transactions.length; check++) {
      if (moment(transactions[check].date, 'YYYY-MM-DD').format('MMMM YYYY') !== monthAndYear) {
        end = check
        break
      }
    }

    if (end >= 1) {
      transactionsByMonth.push(transactions.slice(start, end))
      increment = end - start
    }
    else {
      transactionsByMonth.push(transactions.slice(start, transactions.length))
      start = transactions.length
    }

  }

  console.log('\nDone sorting transactions')
  console.log('transactions by month:')
  console.log(JSON.stringify(transactionsByMonth, null, 2))
  console.log('months by year:')
  console.log(monthsByYear)
  dispatch(sortingTransEnd(transactionsByMonth, monthsByYear))
}

module.exports = {
  addMemberData,
  changeUser,
  changeView,
  fetchAccounts,
  fetchUsers,
  getMemberData,
  getUsers,
  linkAccount,
  linkDone,
  sortTransactions,
  sortingTransStart,
  sortingTransEnd
}
