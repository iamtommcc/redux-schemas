import { combineReducers, createStore } from 'redux';
import books from './schemas/books';

const rootReducer = combineReducers({
  books
});

export default createStore(
  rootReducer,
  {},
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
