import mapObject from 'object-map';
import createSchema from './createSchema';

export function schemaDefaults(defaultSettings) {
  return function(schemaName, actionCreators, selectors, initialState) {
    return createSchema(
      schemaName,
      mapObject(actionCreators, actionCreator => {
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
