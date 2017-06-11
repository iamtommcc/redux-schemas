import get from 'lodash.get';
import snakeCase from 'lodash.snakecase';
import toUpper from 'lodash.toupper';
import mapObject from 'object-map';
export const ASYNC_SUCCESS_SUFFIX = '_SUCCESS';
export const ASYNC_FAILURE_SUFFIX = '_FAILURE';

export function createReducer(initialState, handlers, scope) {
  return function reducer(state = initialState, action) {
    const scopedState = scope ? get(state, scope) : state;
    if (!scopedState) return scopedState;
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](scopedState, action);
    } else {
      return scopedState;
    }
  };
}

export function createAction(type, payload, error, meta) {
  const action = {
    type,
    payload,
    error,
    meta
  };
  Object.keys(action).forEach(
    key => action[key] === undefined ? delete action[key] : ''
  );
  return action;
}

export function generateActionCreator(actionName) {
  return (payload, error, meta) =>
    createAction(toUpper(snakeCase(actionName)), payload, error, meta);
}

export function generateAsyncActionCreator(
  actionName,
  request,
  actionCreators
) {
  return payload => {
    return dispatch => {
      dispatch(createAction(actionName, payload));

      const schema = mapObject(actionCreators, actionCreator => {
        return payload => dispatch(actionCreator(payload));
      });

      return request(payload, schema, dispatch)
        .then(response => {
          // Note that for flexibility, we are passing along
          // both the response AND the original payload.
          // This is useful if the API you are interfacing with
          // doesn't provide verbose responses.
          dispatch(
            createAction(
              toUpper(snakeCase(`${actionName}${ASYNC_SUCCESS_SUFFIX}`)),
              response,
              undefined,
              payload ? { originalPayload: payload } : undefined
            )
          );
        })
        .catch(error => {
          dispatch(
            createAction(
              toUpper(snakeCase(`${actionName}${ASYNC_FAILURE_SUFFIX}`)),
              error,
              true,
              payload ? { originalPayload: payload } : undefined
            )
          );
          throw error;
        });
    };
  };
}
