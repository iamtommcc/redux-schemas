# redux-schemas

`redux-schemas` is a small library designed to abstract away the verbosity & boilerplate that comes when using Redux, particularly when dealing with async actions.

* Removes the need for action name constants
* Reducers, requests, selectors & initial state for a particular entity all live under the one roof.
* Selectors are scoped, just like reducers - the `state` argument represents your state slice rather than the global state.
* For async actions, reducers can be split into a main one and a seperate one to handle the asynchronous lifecycle. Useful for handling `isLoading` boilerplate.

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

First, define a schema - all you need is a name and a a series of actions. At the very least, each action needs a `reduce` property. By adding a `request` property with a function that returns a Promise, you can make an async action.
```javascript
export default createSchema(
  'books',
  {
    // A simple async method (thunk)
    addBook: {
      request: (payload, schema, dispatch) =>
        api('http://example.com/', payload),

      // Reducer on promise success
      reduce: (state, action) => {
        return {
          ...state,
          entities: state.entities.concat([action.payload])
        };
      }
    },

    // A simple synchronous method
    changeGenre: {
      reduce: (state, action) => {
        return {
          ...state,
          genre: action.payload
        };
      }
    }
  },
  {
    // Selectors are scoped to this state slice, with a global state escape hatch! 👌
    bookCount: (state, globalState) => state.entities.length
  }
);
```

Then add them to a store, using the optional `combineSchemas` helper to handle keys & merging of initial state. **You can mix and match currently existing reducers with `redux-schemas` reducers**, allowing you to incrementally adopt `redux-schemas` if required.
```javascript
import books from './schemas/books';
import movies from './schemas/movies';
import anotherReducer from './reducers/other';
import { createStore } from 'redux';
import { combineSchemas, thunk } from 'redux-schemas';

const schemas = combineSchemas([books, movies]);

export default createStore(
  combineReducers({ schemas, anotherReducer }), 
  {},
  applyMiddleware(thunk)
);
```

Then your schemas are good to go!
```javascript
import { store } from './your-store';
import 'books' from './schemas/books';

store.dispatch(
  books.actionCreators.addBook({name: '1984'})
);
```

## API

### createSchema(schemaName, actionCreators, selectors = {}, initialState = {})

| Parameter | Description |
| --- | --- |
| `schemaName` | Name of the schema - used for actions & the key for this particular slice of state |
| `actionCreators` | Object of action creator definitions. At the very least, a definition must have a `reduce` prop. Add a `request` function that returns a Promise to make it async. |
| `selectors` *(optional)* | Object of selector functions that take `state` as a parameter (**`state` is scoped to the schema key**, but the global state is passed as a second argument as an escape hatch). |
| `initialState` *(optional)* | The initial state for this schema key. |

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
| `namespace` | Dot notation string representing the state path where your schemas should live. |

#### Returns
A reducer function ready to be used in `combineReducers`, that also has an `initialState` prop with the combined initial state from all provided reducers.

### withSchemas(...schemas)

| Parameter | Description |
| --- | --- |
| `schemas` | Array of schemas (or several params) to hook up to a React component |

#### Returns
An array of parameters to be spread into a `react-redux` `connect()` function. The props you'll end up getting will be namespaced by the schema name (e.g. `this.props.books` will contain both selectors & action creators for the `books` schema). If an action creator & selector share the same name, the action creator will take precedence.

## More Usage Examples

### Usage with React

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

To make hooking up multiple schemas easier, you can use the `withSchemas` helper which generates `mapStateToProps` and `mapDispatchToProps` for several schemas at once, which can then be spread into a `connect` function:
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
`redux-schemas` lets you have total control over the request lifecycle. **By default, if you pass a function to `reduce` in an async schema action, that reducer will be run on request success**. You can instead pass an `initial`/`success`/`failure` object for more flexibility

The most common use case for this would be for optimistic state updates that get applied immediately, and then reverted on failure.
```javascript
createSchema("books", {
  addBook: {
    request: payload => api("http://example.com/", payload),
    reduce: {
      initial: (state, action) => {
        // Optimistically update state without waiting for API
        return {
          ...state,
          entities: state.entities.concat([payload])
        };
      },
      success: state => state,
      failure: (state, action) => {
        // Revert optimistic changes on failure
        return {
          ...state,
          entities: state.entities.slice(0, state.entities.length - 1)
        };
      }
    }
  }
});
```

### Dispatching other actions as side effects
Along with the `payload` argument, your request functions also receive two extra arguments: `schema`, which allows you to call other actions from this schema that are immediately dispatched, and `dispatch` itself.
```javascript
createSchema('books', {
  tidyUpBookshelf: {
    reduce: state => ({ ...state, bookshelfTidy: true })
  },
  addBook: {
    request: (payload, schema, dispatch) => {
      return api('http://example.com/', payload).then(() => {
        schema.tidyUpBookshelf(); // immediately dispatched
        dispatch(anotherSchema.actionCreators.doSomething());
      });
    },
    reduce: (state, action) => ({
      ...state,
      entities: state.entities.concat([action.payload])
    })
  }
});
```

### reduceRequest
When using an async schema action (a.k.a one with `request` defined) `redux-schemas` lets you run another set of reducers alongside your main reduction logic.

This is designed to help you abstract out common `isLoading` boilerplate that is probably the same for almost all the entities you're working with.

**By default** a generic `reduceRequest` is provided. It manages an `isLoading` key as well as an `error` key. You can use your own, or disable the functionality by setting `reduceRequest` to `null` or `false`.

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
    
    // The following is what it's set to by default
    reduceRequest: {
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
Just wrap the `createSchema` function & process as you please. For large applications, its assumed that you'd almost certainly want to do this.

If you're feeling a bit lazy, there's a handy `schemaDefaults` helper that takes an object of method defaults,
and generates a `createSchema` function that uses those defaults.

```javascript
import createSchema, { schemaDefaults } from 'redux-schemas';

export function customSchemaCreator(
  schemaName,
  actionCreators,
  selectors,
  initialState
) {
  return schemaDefaults({ reduceRequest: null })(
    schemaName,
    actionCreators,
    selectors,
    initialState
  );
}
```
