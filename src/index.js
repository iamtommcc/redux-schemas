import createModel from 'createModel';

const testModel = createModel({

  key: 'books',
  actionName: 'BOOK',
  create: (bookData) => new Promise((resolve, reject) => setTimeout(() => reject('Failure'), 2000))

});

console.log(testModel);

import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(testModel.reducer, composeEnhancers(applyMiddleware(thunk)));

store.dispatch(testModel.create({1: {id: 1, name: 'Book A'}}));
store.dispatch(testModel.create({2: {id: 2, name: 'Book B'}}));

