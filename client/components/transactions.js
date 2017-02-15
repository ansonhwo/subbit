const React = require('react')
const { connect } = require('react-redux')

const Transactions = ({ monthsByYear, transactionsByMonth }) => {
  return (
    <div id="transactions" className="ui container">
    {
      monthsByYear.length
        ? (
          monthsByYear.map((date, i) => {
            return (
              transactionsByMonth[i].length
                ? (
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
                          return (
                            <tr key={ j }>
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
                : (
                  <div key={ i } className="ui raised inverted blue segment month">
                    <div key={ date+i } className="date">{ date }</div>
                    <p className="none">No reoccurring transactions found.</p>
                  </div>
                )
            )
          })
        )
        : <div className="none">Sorry, we could not find any monthly transactional history.</div>
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
    monthsByYear: state.monthsByYear,
    transactionsByMonth: state.transactionsByMonth
  }
}

module.exports = connect(mapProps)(Transactions)
