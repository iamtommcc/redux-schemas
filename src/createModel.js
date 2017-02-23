import _ from 'lodash';
import {
  generateAsyncActionCreator,
  generateActionCreator,
  ASYNC_SUCCESS_SUFFIX,
  ASYNC_FAILURE_SUFFIX
} from 'src/utils';
import { Iterable, fromJS } from 'immutable';
import defaultMetaReducer from './default-meta-reducer';
/**
 * Simple getter function to support either standard objects
 * or immutables.
 * @param object
 * @param prop
 * @returns {*}
 */
function get (object, prop) {
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
export function generateReducerFunction(mainReducer = null, metaReducer = null, scope = null) {
  return function (state, action) {

    const scopedState = scope ? get(state, scope) : state;

    let newState = scopedState;

    // Run the main reducer.
    if (mainReducer) newState = mainReducer(scopedState, action);

    // If a meta reducer is provided, run it on the state
    // AFTER the normal reducer.
    if (metaReducer) newState = metaReducer(newState, action);

    // Redux expects normal reducers to return brand new
    // global state, so if we're using scoping, we have
    // to manage that properly.
    if (scope) {
      // Immutable.js support
      return Iterable.isIterable(state)
        ? state.set(scope, newState)
        : { ...state, [scope]: newState}
    } else {
      return newState;
    }
  }
}

/**
 * Generates a schema based on the provided na
 * @param modelName {String} The name of the schema, used
 * @param methods
 * @returns {*}
 */
export default function createModel(modelName, methods) {

  return _.reduce(methods, (resultObject, method, methodName) => {

    const reduceMeta = _.isUndefined(method.reduceMeta)
      ? defaultMetaReducer
      : methodName.reduceMeta;

    const scope = modelName;

    // Dynamically create a base action name if one is not provided.
    const actionName = _.toUpper(method.actionName || `${methodName}_${modelName}`);

    // If a request is passed, return a thunk.
    resultObject.actionCreators[methodName] =
      method.request
        ? generateAsyncActionCreator(actionName, method.request)
        : generateActionCreator(actionName);

    if (_.isFunction(method.reduce)) {
      resultObject.reducers[actionName] = generateReducerFunction(method.reduce, (method.request ? (reduceMeta.inital || reduceMeta) : null), scope);
    } else {
      // If a request is passed, return a thunk.
      resultObject.reducers[actionName] = generateReducerFunction(method.reduce.initial, (method.request ? reduceMeta.inital : null), scope);

      if (method.request) {
        resultObject.reducers[`${actionName}${ASYNC_SUCCESS_SUFFIX}`] = generateReducerFunction(method.reduce.success, reduceMeta.success, scope);
        resultObject.reducers[`${actionName}${ASYNC_FAILURE_SUFFIX}`] = generateReducerFunction(method.reduce.failure, reduceMeta.failure, scope);
      }
    }

    return resultObject
  }, {
    reducers: {},
    actionCreators: {}
  });
}