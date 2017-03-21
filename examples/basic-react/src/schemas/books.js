import createSchema from '../../../../src/createSchema';

export default createSchema(
  'books',
  {
    add: {
      request: payload => new Promise(resolve => resolve(1)),
      reduce: {
        success: (state, action) => {
          return { count: state.count + action.payload };
        }
      }
    }
  },
  {
    count: state => state.count
  },
  {
    count: 0
  }
);
