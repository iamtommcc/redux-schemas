# redux-schemas

`redux-schemas` is a small library designed to abstract away the verbosity & boilerplate that comes when using Redux, particularly when dealing with basic async operations with a REST API.

* Removes the need for action name constants
* Creates your action creators (by default, Flux Standard Actions are generated, so the **payload** is all you worry about)
* For async actions, splits reducers into a main one and a seperate one to handle loading state boilerplate.


## Installation

`npm install redux-schemas --save`

## Basic Usage

First, define a schema
```javascript
export default createSchema('books', {
  
  // A simple async method (thunk)
  addBook: {  
  	request: (payload) => api('http://example.com/', payload)  
    
    // Reducer on promise success
    reduce: (state, action) => {
      return {
        ...state,
        entities: state.entities.concat([action.payload])
      }
    }
  },
  
  // A simple sync method
  changeGenre: { 
    reduce: (state, action) => {
      return {
        ...state,
        genre: action.payload
      }
    }
    
  }
});
```

Then, throw your newly created schema(s) into a normal `combineReducers`. Be sure to apply a thunk middleware to your store.
```javascript
import { combineReducers, createStore, applyMiddleware } from 'redux';
import books from 'schemas/books';
import { thunk } from 'redux-schemas';

const reducer = combineReducers({
  books
});

const initialState = {};

export default createStore(
  reducer,
  initialState,
  applyMiddleware(thunk)
);

```


```javascript
import { store } from 'redux';
import 'books' from 'schemas/books';

store.dispatch(books.methods.addBook({name: '1984'}));
```

## Advanced Usage
### Different reducers for initial/succeeding/failing requests
```javascript
createSchema('books', {
  addBook: {
    request: (payload) => api('http://example.com/', payload),  
    reduce: {
      initial: (state, action) => state,
      success: (state, action) => {
          return {
          ...state,
          entities: state.entities.concat([action.payload])
        }
      },
      failure: (state, action) => state
    }
  }
}
```

### Async meta reducers
As well as running your main reducer(s), `redux-schemas` play a meta reducer for async actions.

Writing nearly-identical reduction logic for things like `isLoading` keys across all your entities can be a chore. `redux-schemas` separates this from your "main" reduction logic to maximize reusability. 

**By default** a generic catch-all loading reducer is provided that handles an `isLoading` key as well as an `error` key. You can use your own, or disable the functionality by setting `reduceLoading` to `null` or `false`.
```javascript
createSchema('books', {
  addBook: {
    request: (payload) => api('http://example.com/', payload)  
    reduce: (state, action) => {
      return {
        ...state,
        entities: state.entities.concat([action.payload])
      }
    },
    
    // Your custom reducers for async meta stuff (e.g. handling isLoading or error props)
    // The following is what it's set to by default
    reduceLoading: {
      initial: (state, action) => {
         return {
           ...state,
           isLoading: true,
           error: null
         }
       },
       success: (state, action) => {
         return {
           ...state,
           isLoading: false,
           error: null
         };
       },
       failure: (state, action) => {
         return {
           ...state,
           isLoading: false,
           error: action.payload
         }
       }
  }
}
```

### Change default settings
Just decorate the `createSchema` function & process as you please!

Don't want to deal with deep merging yourself? No problem. We've provided a `schemaDefaults` helper that takes an object of method defaults,
and generates a `createSchema` function that uses those defaults.
```javascript
import createSchema, { schemaDefaults } from 'redux-schemas';

export function customSchemaCreator(schemaName, methods) {
  return schemaDefaults({reduceLoading: null})(schemaName, methods);
}