import get from 'lodash.get';
import snakeCase from 'lodash.snakecase';
import toUpper from 'lodash.toupper';
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

export function generateAsyncActionCreator(actionName, request) {
  return payload => {
    return dispatch => {
      dispatch(createAction(actionName, payload));

      return request(payload)
        .then(response => {
          dispatch(
            createAction(
              toUpper(snakeCase(`${actionName}${ASYNC_SUCCESS_SUFFIX}`)),
              response
            )
          );
        })
        .catch(error => {
          dispatch(
            createAction(
              toUpper(snakeCase(`${actionName}${ASYNC_FAILURE_SUFFIX}`)),
              error,
              true
            )
          );
        });
    };
  };
}
