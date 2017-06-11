export default [
  {
    add: {
      reduce: (state, action) => {
        return { number: (state.number || 0) + action.payload };
      }
    },
    dispatchSideEffects: {
      request: (payload, schema, dispatch) =>
        Promise.resolve().then(schema.dispatchAnotherAction()),
      reduce: state => state
    },
    dispatchAnotherAction: {
      reduce: state => state
    },
    addAsync: {
      request: payload =>
        new Promise(
          (resolve, reject) => payload ? resolve(payload) : reject('Failure')
        ),
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
      reduceRequest: {
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
    dynamicSelector: state => state.number,
    globalStateSelector: (state, globalState) =>
      globalState.schemas.counter.number
  },
  {
    number: 0
  }
];
