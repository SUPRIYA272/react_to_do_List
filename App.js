import React, { useState, useEffect } from 'react';
import Content from './Content';
import Footer from './Footer';
import Header from './Header';
import AddItem from './AddItem';
import SearchItem from './SearchItem';
import apiRequest from './apiRequest';

function App() {
  const API_URL = 'http://localhost:3500/items';
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState('');
  const [search, setSearch] = useState('');
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw Error('Data not received');
        const fetchedItems = await response.json();
        console.log(fetchedItems);
        setItems(fetchedItems);
        setFetchError(null);
      } catch (err) {
        setFetchError(err.stack);
      } finally {
        setIsLoading(false);
      }
    };

    // No need for setTimeout, directly call the async function
    fetchItems();
  }, []);

  const addItem = async (newItemText) => {
    const id = items.length ? items[items.length - 1].id + 1 : 1;
    const addNewItem = { id, checked: false, item: newItemText };

    const postOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addNewItem),
    };

    const result = await apiRequest(API_URL, postOptions);

    if (result) setFetchError(result);
    else setItems((prevItems) => [...prevItems, addNewItem]);
  };

  const handleCheck = async (id) => {
    const myItem = items.find((item) => item.id === id);
    const updateOptions = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ checked: !myItem.checked }),
    };

    const requrl = `${API_URL}/${id}`;
    const result = await apiRequest(requrl, updateOptions);

    if (result) setFetchError(result);
    else
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        )
      );
  };

  const handleDelete = async (id) => {
    const deleteOptions = { method: 'DELETE' };
    const requrl = `${API_URL}/${id}`;
    const result = await apiRequest(requrl, deleteOptions);

    if (result) setFetchError(result);
    else setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem) return;
    addItem(newItem);
    setNewItem('');
  };

  return (
    <div className="App">
      <Header title="SUPS, TO DO LIST" />
      <AddItem
        newItem={newItem}
        setNewItem={setNewItem}
        handleSubmit={handleSubmit}
      />
      <SearchItem search={search} setSearch={setSearch} />
      <main>
        {isLoading && <p>Loading items...</p>}
        {fetchError && <p>{`Error: ${fetchError}`}</p>}
        {!isLoading && !fetchError && (
          <Content
            items={items.filter((item) =>
              item.item.toLowerCase().includes(search.toLowerCase())
            )}
            handleCheck={handleCheck}
            handleDelete={handleDelete}
          />
        )}
      </main>
      <Footer length={items.length} />
    </div>
  );
}

export default App;
