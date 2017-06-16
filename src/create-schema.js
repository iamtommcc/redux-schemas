import get from 'lodash.get';
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
 * Generates a normal Redux reducer function that takes
 * an action and returns the new global state.
 *
 *
 * @param mainReducer The 'main' reduce function
 * @param requestReducer An optional request reducer that runs after the main
 * @returns {Function}
 */
export function generateReducerFunction(
  mainReducer = null,
  requestReducer = null
) {
  return function(state, action) {
    let newState = state;

    // Run the main reducer.
    if (mainReducer) newState = mainReducer(newState, action);

    // If a meta (loading) reducer is provided, run it on the state
    // AFTER the normal reducer.
    if (requestReducer && isFunction(requestReducer))
      newState = requestReducer(newState, action);

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
      // Fall back to default reduceRequest behaviour if none provided.
      const reduceRequest = method.reduceRequest === undefined
        ? defaultLoadingReducer
        : method.reduceRequest || {};

      // Create a base action name if one is not provided.
      const actionName = toUpper(
        method.actionName || `${modelName}_${snakeCase(methodName)}`
      );

      // If a request is passed, return a thunk.
      resultObject.actionCreators[methodName] = method.request
        ? generateAsyncActionCreator(
            actionName,
            method.request,
            resultObject.actionCreators
          )
        : generateActionCreator(actionName);

      if (isFunction(method.reduce)) {
        resultObject.reducers[actionName] = generateReducerFunction(
          method.request ? state => state : method.reduce,
          method.request ? reduceRequest.initial || reduceRequest : null
        );
      } else {
        resultObject.reducers[actionName] = generateReducerFunction(
          method.reduce.initial,
          method.request ? reduceRequest.initial : null
        );
      }

      if (method.request) {
        resultObject.reducers[
          `${actionName}${ASYNC_SUCCESS_SUFFIX}`
        ] = generateReducerFunction(
          method.reduce.success || method.reduce,
          reduceRequest.success
        );
        resultObject.reducers[
          `${actionName}${ASYNC_FAILURE_SUFFIX}`
        ] = generateReducerFunction(
          method.reduce.failure,
          reduceRequest.failure
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
    // remove the top level part of the namespace
    // by default: "schemas"
    const keylessNamespace = reducer.namespace.split('.').slice(1);

    const reducedState = createReducer(initialState, schema.reducers)(
      get(state, keylessNamespace.concat([modelName])),
      action
    );

    return set({}, keylessNamespace.concat([modelName]), reducedState);
  };

  // Generates an object of selectors.
  // Can be easily fed into react-redux as
  // a mapStateToProps function.
  const selectorFunction = (globalState, props) => {
    return mapObject(selectors, selector =>
      selector(
        get(globalState, reducer.namespace.split('.').concat([modelName])),
        globalState,
        props
      ));
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
