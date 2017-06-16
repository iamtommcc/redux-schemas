import isString from 'lodash.isstring';
import createSchema from './create-schema';
import reduceReducers from 'reduce-reducers';
import flatCombineReducers from 'flat-combine-reducers';
import thunk from 'redux-thunk';

export default function combineSchemas(schemaArray, namespace = 'schemas') {
  // combineSchemas accepts either an array or a series of arguments
  let schemas = Array.isArray(arguments[0]) ? arguments[0] : [...arguments];

  if (isString(arguments[arguments.length - 1])) {
    schemas = schemas.slice(0, -1);
  }

  const processedSchemas = schemas.map(schema => {
    const newSchema = schema.clone();
    newSchema.namespace = namespace;
    return newSchema;
  });

  const schemaObject = {};
  processedSchemas.forEach(schema => {
    schemaObject[schema.schemaName] = schema;
  });

  const finalReducer = flatCombineReducers(...processedSchemas);

  return finalReducer;
}
