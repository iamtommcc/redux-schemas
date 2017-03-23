import _ from 'lodash';
import createSchema from './createSchema';

export function schemaDefaults(defaultSettings) {
  return function(schemaName, actionCreators, selectors, initialState) {
    return createSchema(
      schemaName,
      _.mapValues(actionCreators, actionCreator => {
        return {
          ...defaultSettings,
          ...actionCreator
        };
      }),
      selectors,
      initialState
    );
  };
}
