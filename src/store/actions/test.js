export const GET_TEST = 'GET_TEST';
export const ADD_TEST = 'ADD_TEST';
export const DELETE_TEST = 'DELETE_TEST';
export const UPDATE_TEST = 'UPDATE_TEST';

const siteUrl = "http://localhost:8080/_api/web/lists/getbytitle('ListaTeste')/items";

export const fetchData = (page, limit, search, order, orderBy) => {
  return dispatch => {
    const queryParams = '';
    fetch(
      siteUrl +
      "?$select=Title",
      {
        method: "GET",
        headers: {
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
        }
      })
      .then(r => r.json())
      .then(data => {
        dispatch({ type: GET_TEST, data: data.d.results });
      })
      .catch(err => console.log(err));
  }
};