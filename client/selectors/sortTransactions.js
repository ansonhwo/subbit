const moment = require('moment')
const { createSelector } = require('reselect')

const getTransactions = state => state.transactions

const sortTransactions = createSelector(
  [ getTransactions ],
  (transactions) => {
    console.log('running sortTransactions selector')
    // console.log('sortTransactions selector')
    // Transaction categories to ignore
    const ignore = [
      'Arts and Entertainment',
      'ATM',
      'Bank Fees',
      'Credit Card',
      'Deposit',
      'Food and Drink',
      'Groceries',
      'Gas Stations',
      'Government Departments and Agencies',
      'Interest',
      'Payroll',
      'Restaurants',
      'Running',
      'Shops',
      'Stadiums and Arenas',
      'Supermarkets and Groceries',
      'Tax',
      'Third Party',
      'Travel',
      'Withdrawal'
    ]

    // Sort transactions by date descending, and filter out transactions
    // that have a non-zero negative amount & lie within ignored categories
    const sortedTransactions = transactions.slice()
      .sort((a, b) => {
        return moment(a.date, 'YYYY-MM-DD').diff(moment(b.date, 'YYYY-MM-DD'), 'days') >= 0 ? -1 : 1
      })
      .filter(transaction => {
        let check = transaction.category.filter(category => {
          return ignore.includes(category)
        })
        return transaction.amount >= 0 && !check.length ? true : false
      })

    // Iterate through all of the transactions (by month)
    // Get the index ranges of all transactions in the same month and year
    // Build an array of arrays grouped by month and year, date descending
    let increment = 1
    const monthsByYear = []
    const transactionsByMonth = []

    for (let start = 0; start < sortedTransactions.length; start += increment) {

      let end = -1
      let monthAndYear = moment(sortedTransactions[start].date, 'YYYY-MM-DD').format('MMMM YYYY')
      monthsByYear.push(monthAndYear)

      // Check for the next instance of a differing month and year
      for (let check = start + 1; check < sortedTransactions.length; check++) {
        if (moment(sortedTransactions[check].date, 'YYYY-MM-DD').format('MMMM YYYY') !== monthAndYear) {
          end = check
          break
        }
      }

      // If there are still more transactions, check the rest
      if (end >= 1) {
        transactionsByMonth.push(sortedTransactions.slice(start, end))
        increment = end - start
      }
      else {
        transactionsByMonth.push(sortedTransactions.slice(start, sortedTransactions.length))
        start = sortedTransactions.length
      }

    }

    // Map through all monthly transactions and check for reoccurrance
    const initialTransactions = []
    const filteredTransactions = transactionsByMonth.map((transactionsForTheMonth, index) => {

      let filtered
      if (index === transactionsByMonth.length - 1) return []
      else {
        filtered = transactionsForTheMonth.filter(thisMonthsTransaction => {
          // 4 day buffer
          const dateLowerBound = -34
          const dateUpperBound = -26

          // Check for identical transactions in the month prior
          let match = transactionsByMonth[index + 1].filter(lastMonthsTransaction => {
            let foundDate = moment(lastMonthsTransaction.date, 'YYYY-MM-DD').diff(thisMonthsTransaction.date, 'days')
            let nameCheck = thisMonthsTransaction.name.split(' ').slice(0, 2).join(' ')

            // Build list of first instances of reoccurring transactions
            if (lastMonthsTransaction.name.includes(nameCheck) &&
                  foundDate >= dateLowerBound &&
                  foundDate <= dateUpperBound) {
              if (index === transactionsByMonth.length - 2) {
                initialTransactions.push(lastMonthsTransaction)
              }
              return true
            }
            else return false
          })
          return match.length ? true : false
        })
      }

      return filtered

    })

    // Append the first occurrances of reoccurring transactions
    // to the list of transactions, if there are any
    if (initialTransactions.length) filteredTransactions[filteredTransactions.length - 1] = initialTransactions
    // console.log(JSON.stringify(filteredTransactions, null, 2))
    // console.log(monthsByYear)
    return { transactionsByMonth: filteredTransactions, monthsByYear }
  }
)

module.exports = sortTransactions
