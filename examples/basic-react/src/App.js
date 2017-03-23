import './App.css';

import React from 'react';
import store from './store';
import { Provider, connect } from 'react-redux';
import books from './schemas/books';
import { withSchemas } from '../../../src/index';

@connect(...withSchemas(books))
class BookScreen extends React.PureComponent {
  render() {
    console.log(this.props);
    const { books } = this.props;
    return (
      <div className="App-heading App-flex">
        <h2>Books</h2>
        <strong>Books in storage: {books.bookCount}</strong>
        <a onClick={() => books.addBook()}>Add Book</a>
      </div>
    );
  }
}

class App extends React.PureComponent {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <BookScreen />
        </div>
      </Provider>
    );
  }
}

export default App;
