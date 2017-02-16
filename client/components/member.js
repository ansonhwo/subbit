const React = require('react')
const { connect } = require('react-redux')

const MemberView = require('./memberview.js')

const { changeMemberView } = require('../actions/actions.js')

const Member = ({ memberView, toggleActive }) => {
  return (
    <div id="member">
      <div className="ui secondary pointing two item blue menu">
        <a className={ "item" + (memberView === "Accounts" ? " active" : "") } onClick={ toggleActive }>Accounts</a>
        <a className={ "item" + (memberView === "Transactions" ? " active" : "") } onClick={ toggleActive }>Transactions</a>
      </div>
      <MemberView />
    </div>
  )
}

const mapProps = state => {
  return {
    memberView: state.memberView
  }
}

const mapDispatch = dispatch => {
  return {
    toggleActive: (event) => {
      dispatch(changeMemberView(event.target.textContent))
    }
  }
}

module.exports = connect(mapProps, mapDispatch)(Member)
