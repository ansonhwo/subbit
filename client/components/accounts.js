const React = require('react')
const { connect } = require('react-redux')

const Accounts = ({ accounts }) => {
  return (
    <div>
      <p>Accounts</p>
      {
        accounts.length
          ? (
            accounts.map(account => {
              return (
                <div className="ui raised segment">
                  <p><i className={ ( account.type === 'credit' ? "payment" : "inbox") + " icon" }></i> { account.name } { account.balance }</p>
                </div>
              )
            })
          )
          : null
      }
    </div>
  )
}

const mapProps = state => {
  return {
    accounts: state.accounts
  }
}

module.exports = connect(mapProps)(Accounts)
