import React, { useState, useEffect, useCallback } from 'react';
import { setTimeout } from 'timers';
// import { useSelector, useDispatch } from 'react-redux'
// import * as actions from '../store/actions/test';

export default function Test(props) {
  const listName = "Areas";
  // "http://localhost:8080": "https://herkersistemas.sharepoint.com/sites/gec"
  const siteUrl = "http://localhost:8080/_api/web/lists/getbytitle('" + listName + "')/items";

  const [formDigest, setFormDigest] = useState();
  const [data, setData] = useState();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [orderBy, setOrderBy] = useState("Title");
  const [order, setOrder] = useState("asc");

  function getFormDigest() {
    fetch(
      "http://localhost:8080/_api/contextinfo",
      {
        method: "POST",
        headers: {
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
        }
      })
      .then(r => r.json())
      .then(data => {
        console.log('form digest token', data.d);
        setFormDigest(data.d.GetContextWebInformation.FormDigestValue)
      })
      .catch(err => console.log(err));
  }

  function fetchData() {
    let querySeachText = '';
    if (searchText) querySeachText = "&$filter=substringof('" + searchText + "',Title)";

    fetch(
      siteUrl +
      "?$select=Title,ID,Attachments,AttachmentFiles" +
      "&$expand=AttachmentFiles" +
      "&$top=" + limit +
      "&$orderby=" + orderBy + " " + order +
      querySeachText +
      "&$skiptoken=" + encodeURIComponent("Paged=TRUE&p_ID=" + page + "")
      ,
      {
        method: "GET",
        headers: {
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
        }
      })
      .then(r => r.json())
      .then(data => {
        console.log('list data', data.d.results);
        setData(data.d.results);
      })
      .catch(err => console.log(err));
  }

  useEffect(() => {
    getFormDigest();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, searchText]);

  const addItemHandle = () => {
    console.log(listName, formDigest);
    fetch(
      siteUrl,
      {
        method: "POST",
        body: {
          '__metadata': {
            type: `SP.Data.${listName}ListItem`
          },
          'Title': 'Test asdlakjsd'
        },
        headers: {
          // "Authorization": "Bearer " + accessToken,
          "X-RequestDigest": formDigest,
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          // "Content-Length": '1',
        },
      })
      .then(r => console.log(r))
      .catch(err => console.log(err));

  }

  const handleChangeFilter = async (e) => {
    setSearchText(e.target.value);
  }

  const handlePageClick = (num) => {
    setPage(prevState => {
      console.log(limit, prevState, prevState + (+num * limit));
      return prevState + (+num * limit)
    });
  }

  const handleUpdate = (id) => {
    fetch(
      `${siteUrl}(${id})`,
      {
        method: "POST",
        body: {
          '__metadata': {
            type: `SP.Data.${listName}ListItem`
          },
          'Title': 'Test Update'
        },
        headers: {
          "X-RequestDigest": formDigest,
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE",
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          // "Content-Length": 2,
        },
      })
      .then(r => {
        console.log(r)
        fetchData();
      })
      .catch(err => console.log(err));
  }

  const handleDelete = (id) => {
    fetch(
      `${siteUrl}(${id})`,
      {
        method: "POST",
        headers: {
          "X-RequestDigest": formDigest,
          "IF-MATCH": "*",
          "X-HTTP-Method": "DELETE",
        },
      })
      .then(r => {
        console.log(r)
        fetchData();
      })
      .catch(err => console.log(err));
  }

  return (
    <div>
      <input type='text' />
      <button onClick={addItemHandle}>ADD ITEM</button>
      <div>
        filter
      <input type='text' onChange={handleChangeFilter} />
      </div>
      <ul>
        {data && data.map(key => (
          <li key={key.Title}>
            {key.Title}
            <input type='text' />
            <button onClick={() => handleUpdate(key.Id)}>UPDATE</button>
            <button onClick={() => handleDelete(key.Id)}>REMOVE</button>
            <div>
              {console.log(key.AttachmentFiles.results)}
              {key.AttachmentFiles.results.length > 0 &&
                key.AttachmentFiles.results.map(attach => {
                  console.log(attach)
                  return (
                    <div key={key.Id + attach.FileName}>
                      <label>{attach.FileName}</label>
                      <button onClick={() => window.open('https://herkersistemas.sharepoint.com' + attach.ServerRelativeUrl)}>download file</button>
                    </div>
                  )
                })}
            </div>
          </li>
        ))}
        <button onClick={() => handlePageClick(-1)}>{'<'}</button>
        <button onClick={() => handlePageClick(1)}>{'>'}</button>
      </ul>
    </div>
  )
}