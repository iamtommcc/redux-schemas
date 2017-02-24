# redux-schemas

`redux-schemas` is a small library designed to abstract away the verbosity & boilerplate that comes when using Redux, particularly when dealing with basic async operations with a REST API.

* Removes the need for action name constants
* Creates your action creators (by default, Flux Standard Actions are generated)
* Boilerplate 'meta' reducer logic for errors, `isLoading`, etc.
* Scopes your reducers to the schema that you're dealing with


## Installation

`npm install redux-schemas --save`

## Basic Usage


```javascript
// First, define your schema
const books = createSchema('books', {
  
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
        genre: actionpayload
      }
    }
    
  }
});



dispatch(books.methods.addBook({name: '1984'}));
```

## Advanced Usage
### Different reducers for initial/succeeding/failing requests
```javascript
createSchema('books', {
  addBook: {
    request: (payload) => api('http://example.com/', payload)  
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

### Custom meta reducers
By default, `redux-schemas` plays a generic "meta" reducer for async actions, *after* the main reducer has run. These default meta reducers are very basic and manage an `isLoading` key in the state, as well as an `error` key if necessary.

You can use your own, or disable the functionality by setting reduceMeta to `null` or `false`.
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
    
    // Your custom reducers for 'meta' info (like isLoading)
    reduceMeta: {
     initial: (state, action) => state,
     success: (state, action) => state,     
     failure: (state, action) => state,
    }
  }
}
```