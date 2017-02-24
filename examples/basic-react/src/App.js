import './App.css'

import React from 'react'
import store from './store';
import { Provider } from 'react-redux'
let App = React.createClass({
  render() {
    return (
    <Provider store={store}>
      <div className="App">
        <div className="App-heading App-flex">
          <h2>Welcome to a basic React example for <span className="App-react">redux-schemas</span></h2>
        </div>
      </div>
    </Provider>
    );
  }
})

export default App
