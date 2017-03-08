import _ from 'lodash';
export const ASYNC_SUCCESS_SUFFIX = '_SUCCESS';
export const ASYNC_FAILURE_SUFFIX = '_FAILURE';

export function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (!state) return state;
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

export function createAction(type, payload, error, meta) {
  return _.omitBy({
    type,
    payload,
    error,
    meta
  }, _.isUndefined)
};

export function generateActionCreator (actionName) {
  return (payload, error, meta) => createAction(_.toUpper(_.snakeCase(actionName)), payload, error, meta);
}

export function generateAsyncActionCreator (actionName, request) {
  return (payload) => {
    return (dispatch) => {

      dispatch(createAction(actionName, payload));

      return request(payload)
        .then((response) => {
          dispatch(createAction(_.toUpper(_.snakeCase(`${actionName}${ASYNC_SUCCESS_SUFFIX}`)), response));
        })
        .catch(error => {
          dispatch(createAction(_.toUpper(_.snakeCase(`${actionName}${ASYNC_FAILURE_SUFFIX}`)), error, true))
        })
    }
  }
}