import './App.css';

import React from 'react';
import store from './store';
import { Provider, connect } from 'react-redux';
import books from './schemas/books';
import { withSchemas } from '../../../src/index';

@connect(...withSchemas(books))
class BookScreen extends React.PureComponent {
  render() {
    const { books } = this.props;
    return (
      <div className="App-heading App-flex">
        <h2>Books</h2>
        <strong>Book count: {books.bookCount}</strong>
        {books.isLoading && <span className="loading">Loading...</span>}
        <a className="button" onClick={() => books.addBook(1)}>Add Book</a>
        <a className="button" onClick={() => books.addBookAsync(1)}>
          Add Book (async)
        </a>
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
