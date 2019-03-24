import '@babel/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducer from 'reducer';
import Main from 'Main';

const defaultStore = {
    graph: null,
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, {
    ...defaultStore,
}, composeEnhancers(applyMiddleware(thunk)));

ReactDOM.render(<Provider store={store}><Main /></Provider>, document.getElementById('root'));