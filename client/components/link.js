const React = require('react')
const { connect } = require('react-redux')

const { linkAccount, linkDone } = require('../actions/actions.js')

// Should move accounts.length display to another component
const Link = ({ view, accounts, addAccount }) => {
  return (
    view === 'link'
      ? (
        <div className="ui container">
          {
            accounts.length
              ? <div></div>
              : null
          }
          <button className="ui blue button" onClick={ addAccount }>Link your account</button>
        </div>
      )
      : null
  )
}

const mapProps = state => {
  return {
    view: state.view,
    accounts: state.accounts
  }
}

const mapDispatch = dispatch => {
  return {
    addAccount: (event) => {
      //console.log(document.querySelector('#user .text').value)
      // Link handler for Plaid Link module
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
            body: JSON.stringify({ token, institution: metadata.institution.type })
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

module.exports = connect(mapProps, mapDispatch)(Link)
