import createSchema from '../../../../src/createSchema';

export default createSchema(
  'books',
  {
    addBookAsync: {
      request: payload =>
        new Promise(resolve => setTimeout(() => resolve(payload), 1000)),
      reduce: (state, action) => {
        return { bookCount: state.bookCount + action.payload };
      }
    },
    addBook: {
      reduce: (state, action) => {
        return { bookCount: state.bookCount + action.payload };
      }
    }
  },
  {
    bookCount: state => state.bookCount,
    isLoading: state => state.isLoading
  },
  {
    bookCount: 0
  }
);
