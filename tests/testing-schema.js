export default [
  {
    add: {
      reduce: (state, action) => {
        return { number: (state.number || 0) + action.payload };
      }
    },
    addAsync: {
      request: payload => new Promise(resolve => resolve(payload)),
      reduce: {
        success: (state, action) => {
          return { number: (state.number || 0) + action.payload };
        }
      }
    },
    addAsyncCustomLoading: {
      request: payload =>
        new Promise((resolve, reject) => {
          if (Number.isInteger(payload)) {
            resolve(payload);
          } else {
            reject();
          }
        }),
      reduce: {
        success: (state, action) => {
          return { number: (state.number || 0) + action.payload };
        }
      },
      reduceloading: {
        initial: state => state,
        success: (state, action) => {
          return {
            ...state,
            isLoading: 'ALL DONE'
          };
        },
        failure: state => {
          return {
            ...state,
            error: 'error'
          };
        }
      }
    }
  },
  {
    fixedSelector: state => 'Test',
    dynamicSelector: state => state.number
  },
  {
    number: 0
  }
];
