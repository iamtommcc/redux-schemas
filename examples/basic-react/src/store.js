import books from './schemas/books';
import movies from './schemas/movies';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { combineSchemas, thunk } from '../../../src/index';

const schemas = combineSchemas([books, movies]);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  combineReducers({
    schemas
  }),
  {},
  composeEnhancers(applyMiddleware(thunk))
);
