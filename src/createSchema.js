import _ from 'lodash';
import {
  generateAsyncActionCreator,
  generateActionCreator,
  ASYNC_SUCCESS_SUFFIX,
  ASYNC_FAILURE_SUFFIX,
  createReducer
} from './utils';
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
 *
 * @param mainReducer The 'main' reduce function
 * @param metaReducer An optional meta reducer that runs after the main
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

    // If a meta (loading) reducer is provided, run it on the state
    // AFTER the normal reducer.
    if (metaReducer && _.isFunction(metaReducer))
      newState = metaReducer(newState, action);

    // Redux expects normal reducers to return brand new
    // global state, so if we're using scoping, we have
    // to manage that properly.
    return newState;
  };
}

/**
 * Generates a schema based on the provided name.
 * @param modelName {String} The name of the schema, used in the store
 * @param actionCreators {Object} Object of action creators
 * @returns {*}
 */
export default function createSchema(
  modelName,
  actionCreators,
  selectors,
  initialState
) {
  const schema = _.reduce(
    actionCreators,
    (resultObject, method, methodName) => {
      const reduceLoading = _.isUndefined(method.reduceLoading)
        ? defaultLoadingReducer
        : method.reduceLoading || {};

      const scope = modelName;

      // Dynamically create a base action name if one is not provided.
      const actionName = _.toUpper(
        method.actionName || `${modelName}_${methodName}`
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
          state => state,
          method.request ? reduceLoading.initial || reduceLoading : null,
          scope
        );
      } else {
        resultObject.reducers[actionName] = generateReducerFunction(
          method.reduce.initial,
          method.request ? reduceLoading.initial : null,
          scope
        );
      }

      if (method.request) {
        resultObject.reducers[
          `${actionName}${ASYNC_SUCCESS_SUFFIX}`
        ] = generateReducerFunction(
          method.reduce.success || method.reduce,
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

      return resultObject;
    },
    {
      reducers: {},
      actionCreators: {}
    }
  );

  // Redux only scopes one level deep by default
  // We need to scope a little further
  const reducer = (state = {}, action) => {
    return {
      [modelName]: createReducer({}, schema.reducers)(state[modelName], action)
    };
  };

  // Generates an object of selectors.
  // Can be easily fed into react-redux as
  // a mapStateToProps function.
  const selectorFunction = state => {
    return _.mapValues(selectors, selector =>
      selector(get(state, `${reducer.namespace}.${modelName}`)));
  };

  Object.defineProperty(reducer, 'schemaName', {
    value: modelName,
    writable: false,
    enumerable: false
  });

  Object.defineProperty(reducer, 'initialState', {
    value: initialState,
    writable: false,
    enumerable: false
  });

  // Define actionCreators as a non enmurable property
  // so it doesn't get picked up by combineReducers
  Object.defineProperty(reducer, 'actionCreators', {
    value: schema.actionCreators,
    writable: false,
    enumerable: false
  });

  Object.defineProperty(reducer, 'selectors', {
    value: selectorFunction,
    writable: true,
    enumerable: false
  });

  Object.defineProperty(reducer, 'namespace', {
    value: 'schemas',
    writable: true,
    enumerable: false
  });

  return reducer;
}
