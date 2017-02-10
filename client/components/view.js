const React = require('react')
const { connect } = require('react-redux')

const Landing = require('./landing.js')
const Link = require('./link.js')
const Login = require('./login.js')

const View = ({ view }) => {
  switch (view) {
    case 'landing':
      return <Landing />
    case 'link':
      return <Link />
    case 'login':
      return <Login />
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
