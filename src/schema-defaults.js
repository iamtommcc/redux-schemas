import _ from 'lodash';
import createSchema from './createSchema';

export function schemaDefaults(defaultSettings) {
  return function (schemaName, methods) {
    return createSchema(schemaName, _.mapValues(methods, method => {
      return {
        ...defaultSettings,
        ...method
      }
    }))
  }
}