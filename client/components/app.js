const React = require('react')
const Link = require('./link.js')
const Login = require('./login.js')

const App = () => {
  return (
    <div>
      <h1>Subbit</h1>
      <Login />
      <Link />
    </div>
  )
}

module.exports = App
