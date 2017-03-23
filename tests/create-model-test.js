import createSchema from 'src/createSchema';
import expect from 'expect';
import expectPredicate from 'expect-predicate';
expect.extend(expectPredicate);
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import * as utils from 'src/utils';
import axios from 'axios';
import { combineSchemas } from '../src/index';
import { combineReducers, createStore, applyMiddleware } from 'redux';

const middleware = applyMiddleware(thunk);

describe('createSchema', () => {
  it('generates basic sync reducers', () => {
    const counter = createSchema('counter', {
      add: {
        reduce: (state, action) => {
          console.log(state, action.payload);
          return { number: (state.number || 0) + action.payload };
        }
      }
    });

    const schemas = combineSchemas([counter]);
    const store = createStore(combineReducers({ schemas }), {}, middleware);

    const action = counter.actionCreators.add(3);
    store.dispatch(action);

    expect(store.getState()).toEqual({ schemas: { counter: { number: 3 } } });
  });

  it('generates basic async reducers', () => {
    const counter = createSchema('counter', {
      add: {
        request: payload => new Promise(resolve => resolve(5)),
        reduce: {
          success: (state, action) => {
            return { number: (state.number || 0) + action.payload };
          }
        }
      }
    });

    const schemas = combineSchemas([counter]);
    const store = createStore(combineReducers({ schemas }), {}, middleware);

    const action = counter.actionCreators.add();
    return store.dispatch(action).then(() => {
      expect(store.getState()).toEqual({
        schemas: {
          counter: { number: 5, isLoading: false, error: null }
        }
      });
    });
  });

  it('generates selectors', () => {
    const counter = createSchema(
      'counter',
      {
        add: {
          reduce: state => state
        }
      },
      {
        fixedSelector: state => 'Test',
        dynamicSelector: state => state
      }
    );

    const schemas = combineSchemas([counter]);
    const store = createStore(
      combineReducers({ schemas }),
      { schemas: { counter: 4 } },
      middleware
    );

    const state = store.getState();

    expect(counter.selectors(state).fixedSelector).toBe('Test');
    expect(counter.selectors(state).dynamicSelector).toBe(4);
  });
});
