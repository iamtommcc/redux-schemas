import _ from 'lodash';
import {
  generateAsyncActionCreator,
  generateActionCreator,
  ASYNC_SUCCESS_SUFFIX,
  ASYNC_FAILURE_SUFFIX,
  createReducer
} from './utils';
import { Iterable, fromJS } from 'immutable';
import { combineReducers } from 'redux';
import defaultLoadingReducer from './default-loading-reducer';
/**
 * Simple getter function to support either standard objects
 * or immutables.
 * @param object
 * @param prop
 * @returns {*}
 */
function get(object, prop) {
  if (object && _.isFunction(object.get)) return object.get(prop);
  return _.get(object, prop);
}

/**
 * Generates a normal Redux reducer function that takes
 * an action and returns the new global state.
 *
 * Handles 'scoping' the state to a specific key.
 *
 * @param mainReducer The 'main' reduce function
 * @param metaReducer An optional meta reducer that runs after the main
 * @param scope Optionally have the main & meta reducer 'scoped' to a specific key in the store
 * @returns {Function}
 */
export function generateReducerFunction(
  mainReducer = null,
  metaReducer = null
) {
  return function(state, action) {
    if (!state) return {};

    let newState = state;

    // Run the main reducer.
    if (mainReducer) newState = mainReducer(newState, action);

    // If a meta reducer is provided, run it on the state
    // AFTER the normal reducer.
    if (metaReducer) newState = metaReducer(newState, action);

    // Redux expects normal reducers to return brand new
    // global state, so if we're using scoping, we have
    // to manage that properly.
    return newState;
  };
}

/**
 * Generates a schema based on the provided name.
 * @param modelName {String} The name of the schema, used in the store
 * @param methods {Object} Object of methods
 * @returns {*}
 */
export default function createSchema(modelName, methods) {
  const schema = _.reduce(
    methods,
    (resultObject, method, methodName) => {
      const reduceLoading = _.isUndefined(method.reduceLoading)
        ? defaultLoadingReducer
        : method.reduceLoading || {};

      const scope = modelName;

      // Dynamically create a base action name if one is not provided.
      const actionName = _.toUpper(
        method.actionName || `${methodName}_${modelName}`
      );

      // If a request is passed, return a thunk.
      resultObject.actionCreators[methodName] = method.request
        ? generateAsyncActionCreator(
            actionName,
            method.request,
            method.actionCreator
          )
        : generateActionCreator(actionName, method.actionCreator);

      if (_.isFunction(method.reduce)) {
        resultObject.reducers[actionName] = generateReducerFunction(
          method.reduce,
          method.request ? reduceLoading.initial || reduceLoading : null,
          scope
        );
      } else {
        resultObject.reducers[actionName] = generateReducerFunction(
          method.reduce.initial,
          method.request ? reduceLoading.initial : null,
          scope
        );

        if (method.request) {
          resultObject.reducers[
            `${actionName}${ASYNC_SUCCESS_SUFFIX}`
          ] = generateReducerFunction(
            method.reduce.success,
            reduceLoading.success,
            scope
          );
          resultObject.reducers[
            `${actionName}${ASYNC_FAILURE_SUFFIX}`
          ] = generateReducerFunction(
            method.reduce.failure,
            reduceLoading.failure,
            scope
          );
        }
      }

      return resultObject;
    },
    {
      reducers: {},
      actionCreators: {}
    }
  );

  const reducer = createReducer({}, schema.reducers);

  // Define methods as a non enmurable property
  // so it coesn't get picked up by combineReducers
  Object.defineProperty(reducer, 'methods', {
    value: schema.actionCreators,
    writable: false,
    enumerable: false
  });
  return reducer;
}
