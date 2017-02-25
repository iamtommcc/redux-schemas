export default {
  main: (state, action, options) => {
    return {
      ...state, [key]: {
        ...state[key],
        data: options.isOptimistic ? _.merge({...state[key].data || {}}, action.payload) : state[key].data,
        isLoading: true,
      }
    }
  },
  success: (state, action, options) => {
    return {
      ...state, [key]: {
        ...state[key],
        data: options.isOptimistic ? state[key].data : _.merge({...state[key].data || {}}, action.payload),
        isLoading: false
      }
    };
  },
  failure: (state, action, options) => {
    return {
      ...state, [key]: {
        ...state[key],
        data: options.isOptimistic ? action.payload : state[key].data,
        isLoading: false,
        error: action.error
      }
    }
  }
}