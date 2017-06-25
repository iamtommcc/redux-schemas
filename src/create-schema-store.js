import keyBy from 'lodash.keyby';
import assign from 'lodash.assign';
import reduce from 'lodash.reduce';
import createSchema from './create-schema';
import { compose, createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

export default function createSchemaStore(schemaArray, ...createStoreArgs) {
  const schemaReducers = combineReducers(keyBy(schemaArray, 'schemaName'));

  const finalReducer = createStoreArgs[0]
    ? reduceReducers(schemaReducers, createStoreArgs[0])
    : schemaReducers;

  // Combine schema initial stores with an overriding
  // initial store parameter (if provided);
  const initialState = {
    schemas: assign(
      reduce(
        schemaArray,
        (acc, value) => {
          acc[value.schemaName] = value.initialState;
          return acc;
        },
        {}
      ),
      createStoreArgs[1]
    )
  };

  const enhancer = createStoreArgs[2]
    ? compose(applyMiddleware(thunk), createStoreArgs[2])
    : applyMiddleware(thunk);

  return createStore(finalReducer, initialState, enhancer);
}
