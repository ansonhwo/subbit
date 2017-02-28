const moment = require('moment')

const addMemberData = (memberData) => {
  return { type: 'ADD_MEMBERDATA', memberData }
}

const changeMemberView = (memberView) => {
  return { type: 'CHANGE_MEMBER_VIEW', memberView }
}

const changeTransactionView = (transactionView) => {
  return { type: 'CHANGE_TRANSACTION_VIEW', transactionView }
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

const getTransactionDetails = (transactionDetails) => {
  return { type: 'GET_TRANSACTION_DETAILS', transactionDetails }
}

const getUsers = (users) => {
  return { type: 'GET_USERS', users }
}

const linkAccount = () => {
  return { type: 'ADD_ACCOUNTS' }
}

const linkDone = () => {
  return { type: 'ADD_DONE' }
}

const toggleAccounts = (institutions) => {
  return { type: 'TOGGLE_ACCOUNTS', institutions }
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
      dispatch(getMemberData(res))
      dispatch(changeView('member'))
    })
    .catch(err => console.error(err))
}

module.exports = {
  addMemberData,
  changeMemberView,
  changeTransactionView,
  changeUser,
  changeView,
  fetchAccounts,
  fetchUsers,
  getTransactionDetails,
  getMemberData,
  getUsers,
  linkAccount,
  linkDone,
  toggleAccounts
}
