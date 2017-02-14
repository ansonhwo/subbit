const React = require('react')
const { connect } = require('react-redux')

const Link = require('./link.js')
const Transactions = require('./transactions.js')

const MemberView = ({ memberView }) => {
  switch (memberView) {
    case 'Accounts':
      return <Link />
    case 'Transactions':
      return <Transactions />
    default:
      return null
  }
}

const mapProps = state => {
  return {
    memberView: state.memberView
  }
}

module.exports = connect(mapProps)(MemberView)
