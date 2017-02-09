const React = require('react')
const { connect } = require('react-redux')
const { changeUser, newView } = require('../actions/actions.js')

const Login = ({ view, users, username, changeUser }) => {
  return (
    view === 'login'
      ? (
        <div id="login" className="ui container">
          <p>Login</p>
          <div className="ui simple dropdown">
            <div className="text">{ username }</div>
            <i className="dropdown icon"></i>
            <div className="menu">
              {
                users.map((user, i) => {
                  return <div key={ i } className="item" onClick={ changeUser }>{ user }</div>
                })
              }
            </div>
          </div>
        </div>
      )
      : null
  )
}

const mapProps = state => {
  return {
    view: state.view,
    username: state.username,
    users: state.users
  }
}

const mapDispatch = dispatch => {
  return {
    changeUser: (event) => {
      console.log(event.target.value)
      dispatch(changeUser(event.target.value))
      dispatch(newView('link'))
      // Need to fetch to check if the current user has any existing accounts
      // and if so, add the account information
    }
  }
}

module.exports = connect(mapProps, mapDispatch)(Login)
