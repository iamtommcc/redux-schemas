import _ from 'lodash';
import createSchema from './createSchema';
import reduceReducers from 'reduce-reducers';
import { compose, createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

export default function combineSchemas(schemaArray, namespace = 'schemas') {
  const processedSchemas = schemaArray.map(schema => {
    const newSchema = schema;
    newSchema.namespace = namespace;
    return newSchema;
  });

  const finalReducer = reduceReducers(...processedSchemas);

  // Combine schema initial stores with an overriding
  // initial store parameter (if provided);
  const initialState = _.reduce(
    schemaArray,
    (acc, value) => {
      acc[value.schemaName] = value.initialState;
      return acc;
    },
    {}
  );

  Object.defineProperty(finalReducer, 'initialState', {
    value: initialState,
    writable: false,
    enumerable: false
  });

  console.log(finalReducer);

  return finalReducer;
}
