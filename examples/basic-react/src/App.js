import './App.css';

import React from 'react';
import store from './store';
import { Provider, connect } from 'react-redux';
import books from './schemas/books';

@connect(
  state => {
    return {
      books: state.books
    };
  },
  books.methods
)
class BookScreen extends React.PureComponent {
  render() {
    const { books, add } = this.props;
    return (
      <div className="App-heading App-flex">
        <h2>Books</h2>
        <strong>Books in storage: {books.count}</strong>
        <a onClick={add}>Add Book</a>
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
