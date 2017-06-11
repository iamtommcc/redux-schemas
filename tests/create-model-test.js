import createSchema from 'src/create-schema';
import expect from 'expect';
import expectPredicate from 'expect-predicate';
expect.extend(expectPredicate);
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as utils from 'src/utils';
import axios from 'axios';
import { combineSchemas } from '../src/index';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import testingSchema from './testing-schema';

const middleware = applyMiddleware(thunk);
const counter = createSchema('counter', ...testingSchema);
const schemas = combineSchemas([counter]);
let store;

describe('createSchema', () => {
  beforeEach(() => {
    store = createStore(combineReducers({ schemas }), {}, middleware);
  });

  it('generates basic sync reducers', () => {
    const action = counter.actionCreators.add(3);
    store.dispatch(action);

    expect(store.getState()).toEqual({ schemas: { counter: { number: 3 } } });
  });

  it('generates basic async reducers with default reduceRequest - success', () => {
    let action = counter.actionCreators.addAsync(5);

    return store.dispatch(action).then(() => {
      expect(store.getState()).toEqual({
        schemas: {
          counter: { number: 5, isLoading: false, error: null }
        }
      });
    });

    action = counter.actionCreators.addAsync();
    store.dispatch(action).catch(error => {
      expect(store.getState()).toEqual({
        schemas: {
          counter: { number: 0, isLoading: false, error: 'yeah' }
        }
      });
    });
  });

  it('generates basic async reducers with default reduceRequest - failure', () => {
    let action = counter.actionCreators.addAsync();
    return store.dispatch(action).catch(error => {
      expect(store.getState()).toEqual({
        schemas: {
          counter: { number: 0, isLoading: false, error: 'Failure' }
        }
      });
    });
  });

  it('can dispatch actions as side effects', () => {
    const mockStore = configureMockStore([thunk])({});
    const expectedActions = [
      { type: 'COUNTER_DISPATCH_SIDE_EFFECTS' },
      { type: 'COUNTER_DISPATCH_ANOTHER_ACTION' },
      { type: 'COUNTER_DISPATCH_SIDE_EFFECTS_SUCCESS' }
    ];
    const action = counter.actionCreators.dispatchSideEffects();
    return mockStore.dispatch(action).then(() => {
      expect(mockStore.getActions()).toEqual(expectedActions);
    });
  });

  it('handles custom namespaces/state trees', () => {
    const customNamespaceSchemas = combineSchemas(counter, 'foo.bar');
    store = createStore(
      combineReducers({ foo: customNamespaceSchemas }),
      {},
      middleware
    );
    const action = counter.actionCreators.addAsync(5);

    expect(store.getState()).toEqual({
      foo: {
        bar: {
          counter: { number: 0 }
        }
      }
    });

    return store.dispatch(action).then(() => {
      expect(store.getState()).toEqual({
        foo: {
          bar: {
            counter: { number: 5, isLoading: false, error: null }
          }
        }
      });
    });
  });

  it('generates selectors', () => {
    const state = store.getState();

    expect(counter.selectors(state).fixedSelector).toBe('Test');
    expect(counter.selectors(state).dynamicSelector).toBe(0);
    expect(counter.selectors(state).globalStateSelector).toBe(0);
  });
});
