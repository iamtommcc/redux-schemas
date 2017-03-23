import _ from 'lodash';

export default function withSchemas() {
  // withSchemas accepts either an array or a series of arguments
  const schemaArray = Array.isArray(arguments[0])
    ? arguments[0]
    : [...arguments];

  const generateSelectors = state => {
    return schemaArray.reduce(
      (acc, schema) => {
        acc[schema.schemaName] = schema.selectors(state);
        return acc;
      },
      {}
    );
  };

  const generateActionCreators = dispatch => {
    return schemaArray.reduce(
      (acc, schema) => {
        acc[schema.schemaName] = _.mapValues(schema.actionCreators, action =>
          payload => action(payload)(dispatch));
        return acc;
      },
      {}
    );
  };

  const mergeProps = (stateProps, dispatchProps, ownProps) => {
    // Rely on dispatchProps to get the schema key
    // (since selectors are optional)
    const schemaName = Object.keys(dispatchProps)[0];

    return {
      ...ownProps,
      [schemaName]: {
        ...stateProps[schemaName],
        ...dispatchProps[schemaName]
      }
    };
  };

  return [generateSelectors, generateActionCreators, mergeProps];
}
