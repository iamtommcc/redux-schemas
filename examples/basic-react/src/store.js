import { combineReducers, createStore } from 'redux';
import books from './schemas/books';

const rootReducer = combineReducers({books: books.reducers});

export default createStore(
  rootReducer,
  {books: {}},
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
