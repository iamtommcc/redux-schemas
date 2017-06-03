import lodashGet from 'lodash.get';
import reduce from 'lodash.reduce';
import toUpper from 'lodash.toupper';
import set from 'lodash.set';
import mapObject from 'object-map';
import snakeCase from 'lodash.snakecase';
import isFunction from 'lodash.isfunction';

import {
  generateAsyncActionCreator,
  generateActionCreator,
  ASYNC_SUCCESS_SUFFIX,
  ASYNC_FAILURE_SUFFIX,
  createReducer
} from './utils';
import defaultLoadingReducer from './default-loading-reducer';

/**
 * Simple getter function to support either standard objects
 * or immutables.
 * @param object
 * @param prop
 * @returns {*}
 */
function get(object, prop) {
  if (object && isFunction(object.get)) return object.get(prop);
  return lodashGet(object, prop);
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
    if (metaReducer && isFunction(metaReducer))
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
  const schema = reduce(
    actionCreators,
    (resultObject, method, methodName) => {
      const reduceLoading = method.reduceLoading === undefined
        ? defaultLoadingReducer
        : method.reduceLoading || {};

      // Dynamically create a base action name if one is not provided.
      const actionName = toUpper(
        method.actionName || `${modelName}_${snakeCase(methodName)}`
      );

      // If a request is passed, return a thunk.
      resultObject.actionCreators[methodName] = method.request
        ? generateAsyncActionCreator(
            actionName,
            method.request,
            method.actionCreator
          )
        : generateActionCreator(actionName, method.actionCreator);

      if (isFunction(method.reduce)) {
        resultObject.reducers[actionName] = generateReducerFunction(
          method.request ? state => state : method.reduce,
          method.request ? reduceLoading.initial || reduceLoading : null
        );
      } else {
        resultObject.reducers[actionName] = generateReducerFunction(
          method.reduce.initial,
          method.request ? reduceLoading.initial : null
        );
      }

      if (method.request) {
        resultObject.reducers[
          `${actionName}${ASYNC_SUCCESS_SUFFIX}`
        ] = generateReducerFunction(
          method.reduce.success || method.reduce,
          reduceLoading.success
        );
        resultObject.reducers[
          `${actionName}${ASYNC_FAILURE_SUFFIX}`
        ] = generateReducerFunction(
          method.reduce.failure,
          reduceLoading.failure
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
    const keylessNamespace = reducer.namespace.split('.').slice(1);
    const reducedState = createReducer(initialState, schema.reducers)(
      lodashGet(state, keylessNamespace.concat([modelName])),
      action
    );

    return set({}, keylessNamespace.concat([modelName]), reducedState);
  };

  // Generates an object of selectors.
  // Can be easily fed into react-redux as
  // a mapStateToProps function.
  const selectorFunction = state => {
    return mapObject(selectors, selector =>
      selector(get(state, reducer.namespace.split('.').concat([modelName]))));
  };

  Object.defineProperty(reducer, 'schemaName', {
    value: modelName,
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

  Object.defineProperty(reducer, 'clone', {
    value: () => createSchema(...arguments),
    writable: false,
    enumerable: false
  });

  return reducer;
}
