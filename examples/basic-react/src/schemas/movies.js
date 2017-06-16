import createSchema from '../../../../src/create-schema';

export default createSchema(
  'movies',
  {
    addMovieAsync: {
      request: payload =>
        new Promise(resolve => setTimeout(() => resolve(payload), 1000)),
      reduce: (state, action) => {
        return { movieCount: state.movieCount + action.payload };
      }
    },
    addMovie: {
      reduce: (state, action) => {
        return { movieCount: state.movieCount + action.payload };
      }
    }
  },
  {
    movieCount: state => state.movieCount,
    isLoading: state => state.isLoading
  },
  {
    movieCount: 0
  }
);
