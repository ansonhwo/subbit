const React = require('react')
const { connect } = require('react-redux')

const Accounts = require('./accounts.js')
const store = require('../store/store.js')
const { linkAccount, linkDone } = require('../actions/actions.js')

// Should move accounts.length display to another component
const Link = ({ addAccount }) => {
  return (
    <div id="link" className="ui container">
      <Accounts />
      <button className="ui blue button" onClick={ addAccount }>Link your account</button>
    </div>
  )
}

const mapDispatch = dispatch => {
  return {
    addAccount: (event) => {
      const username = store.getState().username
      // Link handler for Plaid Link module
      const linkHandler = Plaid.create({
        clientName: username,
        env: 'tartan',
        product: 'connect',
        key: 'a1430f4f27921e4c6bdf5f37edfcfa',
        onSuccess: (token, metadata) => {
          let options = {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, institution: metadata.institution.type, username })
          }
          // Send fetch request to PUT /accounts
          // Request should add a new account token to the database
          console.log('Fetch to PUT /connect')
          fetch('/connect', options)
            .then(res => {
              console.log('\tParsing response...')
              res.json()
            })
            .then(res => {
              console.log(res)
              console.log('\tSuccessfully linked an account!')
              dispatch(linkDone())
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
