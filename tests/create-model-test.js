import createSchema from 'src/createSchema';
import expect from 'expect';
import expectPredicate from 'expect-predicate';
expect.extend(expectPredicate);
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import * as utils from 'src/utils';
import axios from 'axios';
import { combineReducers, createStore, applyMiddleware } from 'redux';

const middleware = applyMiddleware(thunk);

describe('createSchema', () => {
  it('generates basic sync models', () => {
    const counter = createSchema('counter', {
      add: {
        reduce: (state, action) => { return { number: (state.number || 0) + action.payload } }
      }
    });
    const store = createStore(combineReducers({counter}), {}, middleware);

    const action = counter.methods.add(3);
    store.dispatch(action);

    expect(
      store.getState()
    ).toEqual({ counter: { number: 3 } });
  });

  it('generates basic async models', () => {
    const counter = createSchema('counter', {
      add: {
        request: (payload) => new Promise(resolve => resolve(5)),
        reduce: {
          success: (state, action) => {
            return { number: (state.number || 0) + action.payload }
          }
        }
      }
    });

    const store = createStore(combineReducers({counter}), {}, middleware);

    const action = counter.methods.add();
    return store.dispatch(action).then(() => {
      expect(store.getState()).toEqual({counter: {number: 5, isLoading: false, error: null}});
    });
  });

});
