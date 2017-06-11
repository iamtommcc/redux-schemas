import expect from 'expect';
import expectPredicate from 'expect-predicate';
expect.extend(expectPredicate);
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { isFSA } from 'flux-standard-action';
import * as utils from 'src/utils';
import axios from 'axios';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('createAction', () => {
  it('creates a flux standard action', () => {
    expect(utils.createAction('ACTION', 'test payload', false, {}))
      .toEqual({
        type: 'ACTION',
        payload: 'test payload',
        error: false,
        meta: {}
      })
      .toPass(isFSA);
  });

  it('can create a standard action with partial arguments', () => {
    expect(utils.createAction('ACTION', 'test payload'))
      .toEqual({
        type: 'ACTION',
        payload: 'test payload'
      })
      .toPass(isFSA);
  });
});

describe('generateActionCreator', () => {
  it('generates an action creator that creates actions', () => {
    expect(
      utils.generateActionCreator('ACTION')('my payload', false, {})
    ).toEqual({
      type: 'ACTION',
      payload: 'my payload',
      error: false,
      meta: {}
    });
  });
});

describe('generateAsyncActionCreator', () => {
  const store = mockStore({});

  afterEach(() => {
    store.clearActions();
  });

  it('dispatches successful promises', () => {
    const actionToDispatch = utils.generateAsyncActionCreator('ACTION', () =>
      Promise.resolve({ bookId: 1 }))(1);
    const expectedActions = [
      { type: 'ACTION', payload: 1 },
      {
        type: 'ACTION_SUCCESS',
        payload: { bookId: 1 },
        meta: { originalPayload: 1 }
      }
    ];

    return store.dispatch(actionToDispatch).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('dispatches failing promises', () => {
    const actionToDispatch = utils.generateAsyncActionCreator('ACTION', () =>
      Promise.reject('Error'))(1);
    const expectedActions = [
      { type: 'ACTION', payload: 1 },
      {
        type: 'ACTION_FAILURE',
        payload: 'Error',
        error: true,
        meta: { originalPayload: 1 }
      }
    ];

    return store.dispatch(actionToDispatch).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
