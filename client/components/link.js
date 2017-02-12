const React = require('react')
const { connect } = require('react-redux')

const Accounts = require('./accounts.js')
const store = require('../store/store.js')
const { linkAccount, linkDone, addMemberData } = require('../actions/actions.js')

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
            body: JSON.stringify({
              token,
              inst_name: metadata.institution.name,
              inst_type: metadata.institution.type,
              username
            })
          }
          // Send fetch request to PUT /accounts
          // Request should add a new account token to the database
          fetch('/connect', options)
            .then(res => res.json())
            .then(res => {
              dispatch(linkDone())
              dispatch(addMemberData(res))
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
