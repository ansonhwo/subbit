const changeUser = (user) => {
  return { type: 'CHANGE_USER', user }
}

const linkAccount = () => {
  return { type: 'ADD_ACCOUNTS' }
}

const linkDone = () => {
  return { type: 'ADD_DONE', accounts: [] }
}

module.exports = {
  changeUser,
  linkAccount,
  linkDone
}
