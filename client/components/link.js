const React = require('react')
const { connect } = require('react-redux')

const { linkAccount, linkDone } = require('../actions/actions.js')

const Link = ({ clickHandler }) => {
  return (
    <div className="ui container">
      <h1>Subbit</h1>
      <button className="ui blue button" onClick={ clickHandler }>Link your account</button>
    </div>
  )
}

const mapDispatch = dispatch => {
  return {
    clickHandler: (event) => {
      // Check if an account token already exists
      /**
      options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: res.access_token })
      }

      // Need to refactor to just send the username in POST body
      console.log('Fetch to POST /connect/get')
      // Access token: 18e05de266ef2c0436328e74634ddf91c3aa46f5e7f5ae9dd8a92a2ae4f9ef5c069ed155bfdbecc5ad0fa732b7be52cbe53803e4c77863b19874085bcc76445a15991979dc122b8909df2ccd66204ba0
      fetch('/connect/get', options)
        .then(res => res.json())
        .then(res => console.log(res))
      **/

      // If not, create a link handler
      const linkHandler = Plaid.create({
        clientName: '',
        env: 'tartan',
        product: 'connect',
        key: 'a1430f4f27921e4c6bdf5f37edfcfa',
        onSuccess: (token, metadata) => {
          let options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
          }
          // Send fetch request to POST /accounts
          // Request should add a new account token to the database
          console.log('Fetch to POST /connect')
          fetch('/connect', options)
            .then(res => res.json())
            .then(res => {
              dispatch(linkDone())
              console.log(res)
            })
            .catch(err => console.error(err))
        },
        onLoad: () => {
          dispatch(linkAccount())
        },
        onExit: (error, metadata) => {
          if (error !== null) console.error('Error when retrieving accounts')
          else console.log('Plaid link exit')
        }
      })
      linkHandler.open()
    }
  }
}

module.exports = connect(null, mapDispatch)(Link)
