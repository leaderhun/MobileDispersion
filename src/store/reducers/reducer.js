import * as actions from 'action';

const reducer = (state, action) => {
    switch (action.type) {
        case actions.STORE_GRAPH:
            return {
                ...state,
                graph: action.graph,
            };
        default:
            return state;
    }
};

export default reducer;