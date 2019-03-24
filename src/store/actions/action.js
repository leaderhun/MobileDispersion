import axios from 'axios';

export const STORE_GRAPH = 'STORE_GRAPH';

const storeGraph = (graph) => ({
    type: STORE_GRAPH,
    graph,
});

export const setGraph = (graph) => (dispatch) => {   
    dispatch(storeGraph(graph));
};

export const getGraph = () => (dispatch, getState) => {
    const state = getState();

    const requestUrl = encodeURI(`${process.env.API_URL}/`);

    axios.get(requestUrl)
        .then((response) => {
            dispatch(storeGraph(response.data));
        })
        .catch(err => console.log(err));
};