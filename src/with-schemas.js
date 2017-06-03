import mapObject from 'object-map';

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
        acc[schema.schemaName] = mapObject(schema.actionCreators, action =>
          payload => {
            const actionResult = action(payload);

            if (typeof actionResult === 'function') {
              return actionResult(dispatch);
            } else {
              return dispatch(actionResult);
            }
          });

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
