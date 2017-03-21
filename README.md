# redux-schemas

`redux-schemas` is a small library designed to abstract away the verbosity & boilerplate that comes when using Redux, particularly when dealing with basic async operations with a REST API.

* Removes the need for action name constants
* No action creators, just methods that handle action dispatching & side effects.
* Reducers, selectors & initial state for a particular entity all live under the one roof.
* For async actions, you can split reducers into a main one and a seperate one to handle loading state boilerplate.


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
}, {
  getBookCount: state => state.entities.length
});
```

Then, create your store by throwing all your schemas in an array & using `createSchemaStore`
```javascript
import books from 'schemas/books';
import { createSchemaStore } from 'redux-schemas';

export default createSchemaStore([
  books
]);

```

```javascript
import { store } from 'yourStore';
import 'books' from 'schemas/books';

store.dispatch(books.methods.addBook({name: '1984'}));
```
## API

### createSchema

| Parameter | Description |
| --- | --- |
| `schemaName` | Name of the schema - used for actions & the key for this particular slice of state |
| `methods` | Object of methods. At the very least, a method must have a reduce prop. |
| `selectors` (optional) | Object of selector functions that take `state` as a parameter (note: `state` is scoped to the schema key). |
| `initialState` (optional) | Initial state for this schema key. |

### createSchemaStore

| Parameter | Description |
| --- | --- |
| `schemaArray` | Array of schemas to build the store with |
| `...createStoreArgs` | The standard `createStore` args which are applied (merged) on top of what is generated from the schema array. This lets you throw in your own special reducers, initial state, middleware, etc. just as you normally world. |

## More Usage Examples

### React
```javascript
import React from 'react';
import { connect } from 'react-redux';
import books from 'schemas/books';

@connect(books.selectors, books.methods)
class BookScreen extends React.Component {
  render() {
    const { add, count } = this.props;
    return (
      <div>
        <h2>Books</h2>
        <strong>Count: {count}</strong>
        <a onClick={add}>Add Book</a>
      </div>
    );
  }
}
```

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

### Change default method settings
Just decorate the `createSchema` function & process as you please!

Don't want to deal with deep merging yourself? No problem. We've provided a `schemaDefaults` helper that takes an object of method defaults,
and generates a `createSchema` function that uses those defaults.
```javascript
import createSchema, { schemaDefaults } from 'redux-schemas';

export function customSchemaCreator(schemaName, methods) {
  return schemaDefaults({reduceLoading: null})(schemaName, methods);
}
```
