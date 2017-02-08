const React = require('react')
const ReactDOM = require('react-dom')
const { Provider } = require('react-redux')

const App = require('./components/app.js')
const store = require('./store/store.js')

ReactDOM.render(
  <Provider store={ store }>
    <App />
  </Provider>,
  document.getElementById('app')
)
