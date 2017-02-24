import createSchema from 'src/createSchema';
import expect from 'expect';
import expectPredicate from 'expect-predicate';
expect.extend(expectPredicate);
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';
import * as utils from 'src/utils';
import axios from 'axios';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('createSchema', () => {
  it('generates basic sync models', () => {

    const store = mockStore({counter: {number: 2}});

const counter = createSchema('counter', {
  add: {
    reduce: (state, action) => { return { number: state.number + action.payload } }
  }
});

    const action = counter.actionCreators.add(3);
    store.dispatch(action);

    expect(
      store.getActions()
    ).toEqual([{type: 'ADD_COUNTER', payload: 3}]);

    expect(
      counter.reducers['ADD_COUNTER'](store.getState(), action)
    ).toEqual({ counter: { number: 5 } });
  });

  it('generates basic async models', () => {

    const store = mockStore({counter: {number: 2}});

    const counter = createSchema('counter', {
      add: {
        request: (payload) => new Promise(resolve => resolve(5)),
        reduce: {
          success: (state, action) => {
            return { number: state.number + action.payload }
          }
        }
      }
    });

    const action = counter.actionCreators.add();
    return store.dispatch(action).then(() => {
      expect(store.getActions()).toEqual([
        {type: 'ADD_COUNTER'},
        {type: 'ADD_COUNTER_SUCCESS', payload: 5},
      ]);
      expect(counter.reducers['ADD_COUNTER_SUCCESS'](store.getState(), {type: 'ADD_COUNTER_SUCCESS', payload: 5})).toEqual({counter: {number: 7, isLoading: false, error: null}});

    });
  });

});
