import books from './schemas/books';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { combineSchemas, thunk } from '../../../src/index';

const schemas = combineSchemas([books]);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  combineReducers({ schemas }),
  {
    schemas: schemas.initialState
  },
  composeEnhancers(applyMiddleware(thunk))
);
