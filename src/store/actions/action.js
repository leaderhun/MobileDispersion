import axios from 'axios';

export const STORE_GRAPH = 'STORE_GRAPH';
export const STORE_ROBOTS = 'STORE_ROBOTS';

const storeGraph = (graph) => ({
    type: STORE_GRAPH,
    graph,
});

const storeRobots = (robots) => ({
    type: STORE_ROBOTS,
    robots,
});

export const setGraph = (graph) => (dispatch) => {   
    dispatch(storeGraph(graph));
};

export const initAlgorithm = (graph, algorithm) => (dispatch) => {
    let requestUrl = encodeURI(`${process.env.API_URL}/graph/build`);

    axios.post(requestUrl, graph.join('\n'), { headers: { 'Content-Type': 'text/plain'}})
        .then((response) => {
            const builtGraph = response.data;

            dispatch(storeRobots(builtGraph.robots));

            const endPoint = algorithm === 0 ? 'helpingSync' : (algorithm === 1 ? 'helpingAsync' : '');
            requestUrl = encodeURI(`${process.env.API_URL}/${endPoint}/init`);

            axios.post(requestUrl, builtGraph)
                .then(() => {
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};

export const step = (algorithm) => (dispatch) => {
    const endPoint = algorithm === 0 ? 'helpingSync' : (algorithm === 1 ? 'helpingAsync' : '');
    const requestUrl = encodeURI(`${process.env.API_URL}/${endPoint}/step`);

    axios.post(requestUrl)
        .then((response) => {
            console.log(response);
        })
        .catch(err => console.log(err));
};

export const run = (algorithm) => (dispatch) => {
    const endPoint = algorithm === 0 ? 'helpingSync' : (algorithm === 1 ? 'helpingAsync' : '');
    const requestUrl = encodeURI(`${process.env.API_URL}/${endPoint}/run`);

    axios.post(requestUrl)
        .then((response) => {
            console.log(response);
        })
        .catch(err => console.log(err));
};