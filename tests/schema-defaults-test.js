import expect from 'expect';
import expectPredicate from 'expect-predicate';
expect.extend(expectPredicate);
import { schemaDefaults } from '../src/schema-defaults';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const middleware = applyMiddleware(thunk);

describe('schemaDefaults', () => {
  it('creates a createSchema function with custom defaults', () => {
    const counter = schemaDefaults({ reduceLoading: null })('counter', {
      add: {
        request: payload => new Promise(resolve => resolve(5)),
        reduce: {
          success: (state, action) => {
            return { number: (state.number || 0) + action.payload };
          }
        }
      }
    });

    const store = createStore(combineReducers({ counter }), {}, middleware);

    const action = counter.methods.add();
    return store.dispatch(action).then(() => {
      expect(store.getState()).toEqual({ counter: { number: 5 } });
    });
  });

  it('does not use custom defaults if options are actually set', () => {
    const counter = schemaDefaults({ reduceLoading: null })('counter', {
      add: {
        request: payload => new Promise(resolve => resolve(5)),
        reduce: {
          success: (state, action) => {
            return { number: (state.number || 0) + action.payload };
          }
        },
        reduceLoading: {
          initial: state => {
            return { ...state, isLoading: true };
          },
          success: state => {
            return {
              ...state,
              isLoading: 'ALL DONE'
            };
          }
        }
      }
    });

    const store = createStore(combineReducers({ counter }), {}, middleware);

    const action = counter.methods.add();
    return store.dispatch(action).then(() => {
      expect(store.getState()).toEqual({
        counter: { isLoading: 'ALL DONE', number: 5 }
      });
    });
  });
});
