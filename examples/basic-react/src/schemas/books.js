import createSchema from '../../../../src/createSchema';

export default createSchema(
  'books',
  {
    addBook: {
      request: payload => new Promise(resolve => resolve(1)),
      reduce: (state, action) => {
        console.log(state, 'state received by reduce');
        console.log(state.bookCount, action.payload);
        return { bookCount: state.bookCount + action.payload };
      },
      reduceLoading: null
    }
  },
  {
    bookCount: state => {
      console.log(state);
      return state.bookCount;
    }
  },
  {
    bookCount: 0
  }
);
