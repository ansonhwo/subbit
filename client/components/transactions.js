const React = require('react')
const { connect } = require('react-redux')

const store = require('../store/store.js')
const { changeTransactionView, getTransactionDetails } = require('../actions/actions.js')

const Transactions = ({ monthsByYear, transactionsByMonth, viewTransaction }) => {
  if (!monthsByYear.length) {
    return (
      <div id="transactions" className="ui container">
        <div className="none">Sorry, we could not find any monthly transactional history.</div>
      </div>
    )
  }

  return (
    <div id="transactions" className="ui container">
    {
      monthsByYear.map((date, i) => {
        return (
          !transactionsByMonth[i].length
            ? (
              <div key={ i } className="ui raised inverted blue segment month">
                <div key={ date+i } className="date">{ date }</div>
                <p className="none">No reoccurring transactions found.</p>
              </div>
            )
            : (
              <div key={ i } className="ui raised inverted blue segment month">
                <div key={ date+i } className="date">{ date }</div>
                <table key={ 'table'+i } className="ui celled striped selectable unstackable inverted blue table">
                  <thead key={ 'head'+i }>
                    <tr>
                      <th className="three wide">Date</th>
                      <th className="ten wide">Name</th>
                      <th className="three wide">Amount</th>
                    </tr>
                  </thead>
                  <tbody key={ 'body'+i }>
                  {
                    transactionsByMonth[i].map((transaction, j) => {
                      let position = [i,j]
                      return (
                        <tr key={ j } className="row" data-name={ transaction.name } onClick={ viewTransaction }>
                          <td>{ transaction.date }</td>
                          <td>
                            <p className="name">{ transaction.name }</p>
                            <p className="categories"><i>{ transaction.category.join(', ') }</i></p>
                          </td>
                          <td className="right aligned">${ transaction.amount.toFixed(2) }</td>
                        </tr>
                      )
                    })
                  }
                  </tbody>
                </table>
                <div key={ total+i } className="total">Monthly Total: ${ total(transactionsByMonth[i]).toFixed(2) }</div>
              </div>
            )
        )
      })
    }
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
    transactionsByMonth: state.transactionsByMonth,
    monthsByYear: state.monthsByYear
  }
}

const mapDispatch = dispatch => {
  return {
    viewTransaction: (event) => {
      let target = event.target.parentElement
      while (!target.className.includes('row')) {
        target = target.parentElement
      }

      const name = target.getAttribute('data-name').split(' ').slice(0, 2).join(' ')
      const transactionsByMonth = store.getState().transactionsByMonth
      // Get a list of details for all transactions that match
      // the name of the clicked transaction
      const details = transactionsByMonth.reduce((matches, transactions) => {
        return matches.concat(transactions.filter(transaction => {
          return transaction.name.includes(name)
        }))
      }, [])

      dispatch(getTransactionDetails(details))
      dispatch(changeTransactionView('details'))
    }
  }
}

module.exports = connect(mapProps, mapDispatch)(Transactions)
