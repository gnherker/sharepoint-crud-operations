import React, { useState, useEffect, useCallback } from 'react';
import { setTimeout } from 'timers';
// import { useSelector, useDispatch } from 'react-redux'
// import * as actions from '../store/actions/test';

export default function Test(props) {
  const listName = "Areas";
  // "http://localhost:8080": "https://herkersistemas.sharepoint.com/sites/gec"
  const siteUrl = `http://localhost:8080/_api/web/lists/getbytitle('${listName}')/items`;

  const [formDigest, setFormDigest] = useState();
  const [data, setData] = useState();
  const [strAddItem, setStrAddItem] = useState('');
  const [strUpdateItem, setStrUpdateItem] = useState('');
  const [attachment, setAttachment] = useState();

  // const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);
  const [topItems, setTopItems] = useState(5);
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
      "&$top=" + topItems +
      // "&$top=" + limit +
      "&$orderby=" + orderBy + " " + order +
      querySeachText
      // "&$skiptoken=" + encodeURIComponent("Paged=TRUE&p_ID=" + page + "")
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
  }, [topItems, searchText]);

  const addItemHandle = () => {
    console.log(listName, formDigest);
    fetch(
      siteUrl,
      {
        method: "POST",
        body: JSON.stringify({
          '__metadata': {
            'type': `SP.Data.${listName}ListItem`
          },
          'Title': strAddItem
        }),
        headers: {
          "X-RequestDigest": formDigest,
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
        },
      })
      .then(r => {
        console.log(r)
        setStrAddItem('');
        fetchData();
      })
      .catch(err => console.log(err));

  }

  const handleChangeFilter = async (e) => {
    setSearchText(e.target.value);
    setTopItems(limit);
  }

  const handlePageClick = (num) => {
    // setPage(prevState => {
    //   console.log(limit, prevState, prevState + (+num * limit));
    //   return prevState + (+num * limit)
    // });
  }

  const handleUpdate = (id) => {
    fetch(
      `${siteUrl}(${id})`,
      {
        method: "POST",
        body: JSON.stringify({
          "__metadata": {
            "type": `SP.Data.${listName}ListItem`
          },
          "Title": strUpdateItem,
        }),
        headers: {
          "X-RequestDigest": formDigest,
          "IF-MATCH": "*",
          "X-HTTP-Method": "MERGE",
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
        },
      })
      .then(r => {
        console.log(r)
        setStrUpdateItem('');
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

  const handleDeleteAttchmentFile = (id, fileName) => {
    fetch(
      `${siteUrl}(${id})/AttachmentFiles/getByFileName('${fileName}')`,
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

  const handleAddAttchmentFile = (id) => {
    fetch(
      `${siteUrl}(${id})/AttachmentFiles/add(FileName='${attachment.name}')`,
      {
        method: "POST",
        body: JSON.stringify(attachment),
        headers: {
          "X-RequestDigest": formDigest,
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
        },
      })
      .then(r => {
        console.log(r)
        fetchData();
      })
      .catch(err => console.log(err));
  }

  const handleChangeFile = (e) => {
    setAttachment(e.target.files[0]);
  }

  const handleLoadMore = () => {
    setTopItems(prevState => prevState + limit)
  }

  const handleChangeText = (e) => {
    setStrAddItem(e.target.value);
  }

  const handleChangeTextUpdate = (e) => {
    setStrUpdateItem(e.target.value);
  }

  return (
    <div style={{ margin: '50px' }}>
      <div style={{ margin: '20px' }}>
        <label>input add item</label>
        <input type='text' onChange={handleChangeText} value={strAddItem} />
        <button onClick={addItemHandle}>ADD ITEM</button>
      </div>
      <div style={{ margin: '20px' }}>
        <label>add file</label>
        <input type='file' onChange={handleChangeFile} />
      </div>
      <div style={{ margin: '20px' }}>
        <label>input update</label>
        <input type='text' onChange={handleChangeTextUpdate} value={strUpdateItem} />
      </div>
      <div style={{ margin: '20px' }}>
        filter
      <input type='text' onChange={handleChangeFilter} />
      </div>
      <ul>
        {data && data.map(key => (
          <li key={key.Title}>
            <span style={{ marginRight: '50px' }}>{key.Title}</span>
            <button onClick={() => handleUpdate(key.Id)}>UPDATE</button>
            <button onClick={() => handleDelete(key.Id)}>REMOVE</button>
            <button onClick={() => handleAddAttchmentFile(key.Id)}>upload file</button>
            <div>
              {/* {console.log(key.AttachmentFiles.results)} */}
              {key.AttachmentFiles.results.length > 0 &&
                key.AttachmentFiles.results.map(attach => {
                  console.log(attach)
                  return (
                    <div key={key.Id + attach.FileName}>
                      <label>{attach.FileName}</label>
                      <button onClick={() => window.open('https://herkersistemas.sharepoint.com' + attach.ServerRelativeUrl)}>download file</button>
                      <button onClick={() => handleDeleteAttchmentFile(key.Id, attach.FileName)}>delete file</button>
                    </div>
                  )
                })}
            </div>
          </li>
        ))}
        {/* <button onClick={() => handlePageClick(-1)}>{'<'}</button>
        <button onClick={() => handlePageClick(1)}>{'>'}</button> */}
        <button onClick={() => handleLoadMore()}>load more</button>
      </ul>
    </div>
  )
}