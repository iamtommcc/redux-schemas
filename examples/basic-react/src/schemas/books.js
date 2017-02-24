import createSchema from '../../../../src/createSchema';

export default createSchema('counters', {
	add: {
		request: (payload) => new Promise(resolve => resolve(5)),
		reduce: {
			success: (state, action) => {
				return { number: state.number + action.payload }
			}
		}
	}
});