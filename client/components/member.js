const React = require('react')
const { connect } = require('react-redux')

const MemberView = require('./memberview.js')

const { changeMemberView } = require('../actions/actions.js')

const Member = ({ toggleActive }) => {
  return (
    <div id="member">
      <div className="ui secondary pointing two item blue menu">
        <a className="item active" onClick={ toggleActive }>Accounts</a>
        <a className="item" onClick={ toggleActive }>Transactions</a>
      </div>
      <MemberView />
    </div>
  )
}

const mapDispatch = dispatch => {
  return {
    toggleActive: (event) => {
      document.querySelector('#member .item.active').classList.remove('active')
      event.target.classList.add('active')

      dispatch(changeMemberView(event.target.textContent))
    }
  }
}

module.exports = connect(null, mapDispatch)(Member)
