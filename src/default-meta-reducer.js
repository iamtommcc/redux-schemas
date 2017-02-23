export default {
  initial: (state, action) => {
    return {
      ...state,
      isLoading: true,
      error: null
    }
  },
  success: (state, action, options) => {
    return {
      ...state,
      isLoading: false,
      error: null
    };
  },
  failure: (state, action, options) => {
    return {
      ...state,
      isLoading: false,
      error: action.payload
    }
  }
}