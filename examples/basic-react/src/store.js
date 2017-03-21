import { combineReducers, createStore, applyMiddleware } from 'redux';
import books from './schemas/books';
import { thunk } from '../../../src/index';

const rootReducer = combineReducers({
  books
});
export default createStore(
  rootReducer,
  { books: { count: 0 } },
  applyMiddleware(thunk)
);
