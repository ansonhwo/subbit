const React = require('react')
const { connect } = require('react-redux')

const Landing = require('./landing.js')
const Login = require('./login.js')
const Member = require('./member.js')

const View = ({ view }) => {
  switch (view) {
    case 'landing':
      return <Landing />
    case 'login':
      return <Login />
    case 'member':
      return <Member />
    default:
      return null
  }
}

const mapProps = state => {
  return {
    view: state.view
  }
}

module.exports = connect(mapProps)(View)
