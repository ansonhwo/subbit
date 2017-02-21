const React = require('react')
const { connect } = require('react-redux')

const store = require('../store/store.js')
const { changeTransactionView, deletePrompt, linkAccount, linkDone, getMemberData, sortingTransStart, sortTransactions, toggleAccounts } = require('../actions/actions.js')

const Accounts = ({ accounts, institutions, deleteAccounts, deletePrompt, deletePromptClose, deletePromptOpen, toggleAccount, toggleAll }) => {
  if (!institutions.length) {
    return (
      <div id="accounts" className="ui container">
        <p className="none">No Accounts Linked</p>
      </div>
    )
  }

  return (
    <div id="accounts" className="ui container">
      <div className={ "ui page dimmer" + (deletePrompt ? " active" : "") }>
        <div className="content">
          <div className="ui container">
            <h2 className="ui inverted icon header">
              <i className="credit card icon"></i>
              Delete Accounts
            </h2>
            <p>Are you sure you want to delete these accounts?</p>
            <span>
              <button className="ui red inverted button" onClick={ deletePromptClose }><i className="remove icon"></i>Cancel</button>
              <button className="ui green inverted button" onClick={ deleteAccounts }><i className="checkmark icon"></i>OK</button>
            </span>
          </div>
        </div>
      </div>
    {
      !institutions.filter(institution => institution.checked).length
        ? <button className="ui button" onClick={ toggleAll }>Select All</button>
        : (
          <span>
            <button className="ui button" onClick={ toggleAll }>Select All</button>
            <button className="ui negative button" onClick={ deletePromptOpen }>Delete Account(s)</button>
          </span>
        )
    }
    {
      institutions.map((inst, i) => {
        // For every institution, render accounts that match that institution
        return (
          <div key={ inst.inst_name+i } className="ui container institution">
            <div className="ui checkbox">
              <input type="checkbox" data-id={ inst.inst_id } onChange={ toggleAccount } checked={ inst.checked }></input>
              <label>{ inst.inst_name }</label>
            </div>
            {
              accounts.filter(account => account.inst_name === inst.inst_name)
                .map((account, j) => {
                  return (
                    <div key={ account+j } className="ui raised segment account">
                      <span className="name"><i className={ ( account.type === 'credit' ? "payment" : "inbox") + " icon" }></i>{ account.name } { account.number }</span><span className="balance">${ account.balance.toFixed(2) }</span>
                    </div>
                  )
              })
            }
          </div>
        )
      })
    }
    </div>
  )
}

const mapProps = state => {
  return {
    accounts: state.accounts,
    deletePrompt: state.deletePrompt,
    institutions: state.institutions
  }
}

const mapDispatch = dispatch => {
  return {
    deleteAccounts: (event) => {
      const { institutions, username } = store.getState()
      const accountsToggled = institutions.filter(institution => institution.checked)
        .map(institution => institution.inst_id)
        .join('+')

      const options = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }

      fetch(`/connect/${username}/${accountsToggled}`, options)
        .then(res => res.json())
        .then(res => {
          dispatch(linkAccount())
          dispatch(sortingTransStart())
          dispatch(getMemberData(res))
          dispatch(sortTransactions(res.transactions))
          dispatch(linkDone())
          dispatch(changeTransactionView('all'))
        })
        .catch(err => console.error(err))
    },
    deletePromptClose: (event) => {
      dispatch(deletePrompt(false))
    },
    deletePromptOpen: (event) => {
      dispatch(deletePrompt(true))
    },
    toggleAccount: (event) => {
      const id = event.target.dataset.id
      const institutions = store.getState().institutions.slice()

      const institutionsToggled = institutions.map((institution, index) => {
        if (institution.inst_id === id) institution.checked = !institution.checked
        return institution
      })

      dispatch(toggleAccounts(institutionsToggled))
    },
    toggleAll: (event) => {
      let selectRest
      const institutions = store.getState().institutions.slice()
      const selected = institutions.filter(institution => institution.checked).length
      if (selected > 0 && selected < institutions.length) selectRest = true

      const institutionsToggled = institutions.map(institution => {
        if (selectRest) {
          if (!institution.checked) {
            institution.checked = true
          }
        }
        else institution.checked = !institution.checked

        return institution
      })

      dispatch(toggleAccounts(institutionsToggled))
    }
  }
}

module.exports = connect(mapProps, mapDispatch)(Accounts)
