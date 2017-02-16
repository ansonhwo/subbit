const React = require('react')
const { connect } = require('react-redux')

const Link = require('./link.js')
const Transactions = require('./transactions.js')
const Details = require('./details.js')

const MemberView = ({ memberView, transactionView }) => {
  switch (memberView) {
    case 'Accounts':
      return <Link />
    case 'Transactions':
      switch (transactionView) {
        case 'all':
          return <Transactions />
        case 'details':
          return <Details />
      }
    default:
      return null
  }
}

const mapProps = state => {
  return {
    memberView: state.memberView,
    transactionView: state.transactionView
  }
}

module.exports = connect(mapProps)(MemberView)
