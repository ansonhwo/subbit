const React = require('react')
const { connect } = require('react-redux')

const { changeView } = require('../actions/actions.js')

const Landing = ({ start }) => {
  return (
    <div id="landing">
      <div className="overlay"></div>
      <div className="ui container">
        <p className="logo">Subbit</p>
        <p className="slogan">Managing monthly transactions has never been easier.</p>
        <button className="ui blue button" onClick={ start }>Get Started</button>
      </div>
    </div>
  )
}

const mapDispatch = dispatch => {
  return {
    start: (event) => {
      dispatch(changeView('login'))
    }
  }
}

module.exports = connect(null, mapDispatch)(Landing)
