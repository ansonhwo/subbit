const React = require('react')
const { connect } = require('react-redux')

const Accounts = ({ accounts, institutions }) => {
  return (
    <div id="accounts">
      <p className="header">Accounts</p>
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
                          <span className="name"><i className={ ( account.type === 'credit' ? "payment" : "inbox") + " icon" }></i>{ account.name }</span><span className="balance">{ account.balance }</span>
                        </div>
                      )
                    })
                  }
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
    accounts: state.accounts,
    institutions: state.institutions
  }
}

module.exports = connect(mapProps)(Accounts)
