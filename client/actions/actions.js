const changeUser = (username) => {
  return { type: 'CHANGE_USER', username }
}

const getUsers = (users) => {
  return { type: 'GET_USERS', users }
}

const newView = (view) => {
  return { type: 'CHANGE_VIEW', view }
}

const linkAccount = () => {
  return { type: 'ADD_ACCOUNTS' }
}

const linkDone = () => {
  return { type: 'ADD_DONE', accounts: [] }
}

const fetchUsers = () => (dispatch) => {
  fetch('/users')
    .then(res => res.json())
    .then(res => dispatch(getUsers))
    .catch(err => console.error(err))
}

module.exports = {
  changeUser,
  linkAccount,
  linkDone,
  fetchUsers,
  newView
}
