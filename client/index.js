const React = require('react')
const ReactDOM = require('react-dom')
const { Provider } = require('react-redux')

const App = require('./components/app.js')
const store = require('./store/store.js')
const { fetchUsers } = require('./actions/actions.js')

ReactDOM.render(
  <Provider store={ store }>
    <App />
  </Provider>,
  document.getElementById('app')
)

//store.dispatch(fetchUsers())
