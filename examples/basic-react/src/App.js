import './App.css';

import React from 'react';
import store from './store';
import { Provider, connect } from 'react-redux';
import books from './schemas/books';
import movies from './schemas/movies';
import { withSchemas } from '../../../src/index';

@connect(...withSchemas(books, movies))
class BookScreen extends React.PureComponent {
  render() {
    const { books, movies } = this.props;
    console.log(movies);
    return (
      <div className="App-heading App-flex">
        <h2>Books</h2>
        <strong>Book count: {books.bookCount}</strong>
        {books.isLoading && <span className="loading">Loading...</span>}
        <a className="button" onClick={() => books.addBook(1)}>Add Book</a>
        <a className="button" onClick={() => books.addBookAsync(1)}>
          Add Book (async)
        </a>
        <h2>Movies</h2>
        <strong>Movie count: {movies.movieCount}</strong>
        {movies.isLoading && <span className="loading">Loading...</span>}
        <a className="button" onClick={() => movies.addMovie(1)}>Add Movie</a>
        <a className="button" onClick={() => movies.addMovieAsync(1)}>
          Add Movie (async)
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
