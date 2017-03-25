import expect from 'expect';
import expectPredicate from 'expect-predicate';
expect.extend(expectPredicate);
import { schemaDefaults, combineSchemas } from '../src/index';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import testingSchema from './testing-schema';

const middleware = applyMiddleware(thunk);

describe('schemaDefaults', () => {
  it('creates a createSchema function with custom defaults', () => {
    const counter = schemaDefaults({ reduceLoading: null })(
      'counter',
      ...testingSchema
    );
    const store = createStore(
      combineReducers({ schemas: combineSchemas(counter) }),
      {},
      middleware
    );

    const action = counter.actionCreators.addAsync(5);
    return store.dispatch(action).then(() => {
      expect(store.getState()).toEqual({ schemas: { counter: { number: 5 } } });
    });
  });

  it('does not use custom defaults if options are actually set', () => {
    const counter = schemaDefaults({ reduceLoading: null })(
      'counter',
      ...testingSchema
    );
    const store = createStore(
      combineReducers({ schemas: combineSchemas(counter) }),
      {},
      middleware
    );

    const action = counter.actionCreators.addAsyncCustomLoading;
    store.dispatch(action(5)).then(() => {
      expect(store.getState()).toEqual({
        schemas: {
          counter: { isLoading: 'ALL DONE', number: 5 }
        }
      });
    });

    store.dispatch(action(null)).then(_.noop).catch(err => {
      expect(store.getState()).toEqual({
        schemas: {
          counter: { error: 'error', number: 0 }
        }
      });
    });
  });
});
