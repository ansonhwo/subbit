const React = require('react')
const { connect } = require('react-redux')

const { changeTransactionView } = require('../actions/actions.js')

const Details = ({ transactionDetails, viewTransactions }) => {
  return (
    <div id="details" className="ui container">
      <div className="ui raised inverted blue segment view">
        <button className="ui icon basic button" onClick={ viewTransactions }><i className="reply icon"></i>  Return to Transactions</button>
        <p className="name">{ transactionDetails[0].name }</p>
        <p className="categories">{ transactionDetails[0].category.join(', ') }</p>
        <table className="ui celled striped selectable unstackable inverted blue table">
          <thead>
            <tr>
              <th className="center aligned">Date</th>
              <th className="center aligned">Amount</th>
            </tr>
          </thead>
          <tbody>
          {
            transactionDetails.map((transaction, i) => {
              return (
                <tr key={ i }>
                  <td className="center aligned">{ transaction.date }</td>
                  <td className="center aligned">${ transaction.amount.toFixed(2) }</td>
                </tr>
              )
            })
          }
          </tbody>
        </table>
        <p className="total">Total: ${ total(transactionDetails).toFixed(2) }</p>
      </div>
    </div>
  )
}

const total = (transactions) => {
  return transactions.reduce((sum, transaction) => {
    return sum += transaction.amount
  }, 0)
}

const mapProps = state => {
  return {
    transactionDetails: state.transactionDetails
  }
}

const mapDispatch = dispatch => {
  return {
    viewTransactions: () => {
      dispatch(changeTransactionView('all'))
    }
  }
}

module.exports = connect(mapProps, mapDispatch)(Details)
