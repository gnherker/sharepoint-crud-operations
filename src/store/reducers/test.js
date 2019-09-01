import { GET_TEST } from "../actions/test";

const initialState = {
  listData: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_TEST:
      return {
        listData: action.data
      };
    default:
      return state;
  }
};