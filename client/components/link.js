const React = require('react')
const { connect } = require('react-redux')

const Accounts = require('./accounts.js')
const store = require('../store/store.js')
const { linkAccount, linkDone, addMemberData, sortTransactionsByMonth } = require('../actions/actions.js')

const Link = ({ addAccount, loadAccounts }) => {
  return (
    <div id="link" className="ui container">
      <p className="header">Accounts</p>
      {
        !loadAccounts
          ? <Accounts />
          : <div><i className="notched circle loading large icon"></i></div>
      }
      <button className="ui blue button" onClick={ addAccount }>Link your account</button>
    </div>
  )
}

const mapProps = state => {
  return {
    loadAccounts: state.loadAccounts
  }
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
            method: 'POST',
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

          dispatch(linkAccount())
          // Send fetch request to POST /accounts
          // Request should add a new account token to the database
          fetch('/connect', options)
            .then(res => res.json())
            .then(res => {
              console.log(JSON.stringify(res, null, 2))
              dispatch(addMemberData(res))
              // Need to sort all of the transactions by date here, then update the store
              dispatch(linkDone())
            })
            .catch(err => console.error(err))
        }
      })
      linkHandler.open()
    }
  }
}

module.exports = connect(mapProps, mapDispatch)(Link)
