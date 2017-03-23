# redux-schemas

`redux-schemas` is a small library designed to abstract away the verbosity & boilerplate that comes when using Redux, particularly when dealing with async actions.

* Removes the need for action name constants
* Reducers, requests, selectors & initial state for a particular entity all live under the one roof.
* For async actions, you can split reducers into a main one and a seperate one to handle loading state boilerplate.

## Contents
* [Installation](#installation)
* [Basic Usage](#basic-usage)
* [API](#api)
* [Advanced Usage](#advanced-usage)


## Installation

`yarn add redux-schemas`

Alternatively:

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
  bookCount: state => state.entities.length
});
```

Then add them to a store, using the optional `combineSchemas` helper to handle keys & merging of initial state. 
```javascript
import books from './schemas/books';
import movies from './schemas/movies';
import anotherReducer from './reducers/other';
import { createStore } from 'redux';
import { combineSchemas, thunk } from 'redux-schemas';

const schemas = combineSchemas([books, movies]);

const initialState = {
  schemas: schemas.initialState,
  otherState: {foo: 'bar'}
};

export default createStore(
  combineReducers({ schemas, anotherReducer }), 
  initialState,
  applyMiddleware(thunk)
);
```

Then your schemas are good to go!
```javascript
import { store } from 'yourStore';
import 'books' from './schemas/books';

store.dispatch(books.actionCreators.addBook({name: '1984'}));
```

## API

### createSchema(schemaName, actionCreators, selectors = {}, initialState = {})

| Parameter | Description |
| --- | --- |
| `schemaName` | Name of the schema - used for actions & the key for this particular slice of state |
| `actionCreators` | Object of actionCreators. At the very least, a method must have a reduce prop. |
| `selectors` *(optional)* | Object of selector functions that take `state` as a parameter (note: `state` is scoped to the schema key). |
| `initialState` *(optional)* | Initial state for this schema key. |

#### Returns
A reducer function ready to be used in `combineReducers`, that also has several extra (non-enumerable) properties:
* `schemaName`
* `actionCreators`
* `selectors`
* `initialState`


### combineSchemas(schemaArray, namespace = 'schemas')

| Parameter | Description |
| --- | --- |
| `schemaArray` | Array of schemas to combine |
| `namespace` | Dot notation string representing the state structure |

#### Returns
A reducer function ready to be used in `combineReducers`, that also has an `initialState` prop with the combined initial state from all provided reducers.

### withSchemas(...schemas)

| Parameter | Description |
| --- | --- |
| `schemas` | Array of schemas (or several params) to hook up to a React component |

#### Returns
An array of parameters to be spread into a `react-redux` `@connect()` function. The props you'll end up getting will be namespaced by the schema name (e.g. `this.props.books` will contain both selectors & action creators for the `books` schema). If an action creator & selector share the same name, the action creator will take precedence.

## More Usage Examples

### React

Hooking up a component to a single schema is a piece of cake :cake:.
```javascript
import React from 'react';
import { connect } from 'react-redux';
import books from './schemas/books';

@connect(books.selectors, books.actionCreators)
class BookScreen extends React.Component {
  render() {
    const { addBook, bookCount } = this.props;
    return (
      <div>
        <h2>Books</h2>
        <strong>Count: {bookCount}</strong>
        <a onClick={addBook}>Add Book</a>
      </div>
    );
  }
}
```

To make hooking up multiple schemas easier, you can use the `withSchemas` helper:
```javascript
import React from 'react';
import { withSchemas } from 'redux-schemas';
import books from './schemas/books';
import movies from './schemas/movies';

@connect(...withSchemas(books, movies))
class BooksAndMovies extends React.Component {
  render() {
    const { books, movies } = this.props;
    return (
      <div>
        <h2>Books</h2>
        <strong>Count: {books.bookCount}</strong>
        <a onClick={books.addBook}>Add Book</a>

        <h2>Movies</h2>
        <strong>Count: {movies.movieCount}</strong>
        <a onClick={movies.addMovie}>Add Movie</a>
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

### reduceLoading
When using an async action creator (a.k.a one with `request` defined) `redux-schemas` lets you run your payload through an extra reducer seperate from your main one. This is useful to avoid repetitive reduction logic for things like managing `isLoading` on every request.

**By default** a generic `reduceLoading` is provided. It manages an `isLoading` key as well as an `error` key. You can use your own, or disable the functionality by setting `reduceLoading` to `null` or `false`.

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
    
    // Your custom isLoading reducer
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
Just decorate the `createSchema` function & process as you please.

If you're feeling a bit lazy, there's a handy `schemaDefaults` helper that takes an object of method defaults,
and generates a `createSchema` function that uses those defaults.

```javascript
import createSchema, { schemaDefaults } from 'redux-schemas';

export function customSchemaCreator(schemaName, actionCreators, selectors, initialState) {
  return schemaDefaults({reduceLoading: null})(schemaName, actionCreators, selectors, initialState);
}
```
