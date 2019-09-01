import React, { useEffect } from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import ReduxThunk from 'redux-thunk';

import dataTest from './store/reducers/test';

import Test from './containers/Test';

const rootReducer = combineReducers({
  data: dataTest,
});
const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

export default function App() {
  return (
    // <Provider store={store}>
    <Test />
    // </Provider>
  );
}