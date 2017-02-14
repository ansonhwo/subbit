const React = require('react')
const { connect } = require('react-redux')

const Accounts = ({ accounts, institutions }) => {
  return (
    <div id="accounts" className="ui container">
    {
      institutions.length
        ? (
          institutions.map((inst, i) => {
            // For every institution, render accounts that match that institution
            return (
              <div key={ inst+i } className="ui container institution">
                <p className="inst-name"><i>{ inst }</i></p>
                {
                  accounts.filter(account => account.inst_name === inst)
                  .map((account, j) => {
                    return (
                      <div key={ account+j } className="ui raised segment account">
                        <span className="name"><i className={ ( account.type === 'credit' ? "payment" : "inbox") + " icon" }></i>{ account.name } { account.number }</span><span className="balance">{ account.balance.toFixed(2) }</span>
                      </div>
                    )
                  })
                }
              </div>
            )
          })
        )
        : (
          <p className="none">No Accounts Linked</p>
        )
    }
    </div>
  )
}

const mapProps = state => {
  return {
    accounts: state.accounts,
    institutions: state.institutions
  }
}

module.exports = connect(mapProps)(Accounts)
