import React, { useState, useEffect } from 'react';
import axios from 'axios';
import  "./App.css";

const API_URL = 'http://localhost:5002/api';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState('');
  const [formData, setFormData] = useState([]);
  const [formInput, setFormInput] = useState({ name: '', email: '', message: '' });
  const [editId, setEditId] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  // Fetch data
  useEffect(() => {
    if (token) {
      axios
        .get(`${API_URL}/data`, { headers: { Authorization: token } })
        .then((res) => setFormData(res.data))
        .catch((err) => console.error(err));
    }
  }, [token]);

  // Login as admin
  const handleLogin = () => {
    axios
      .post(`${API_URL}/login`, loginData)
      .then((res) => {
        setToken(res.data.token);
        setIsAdmin(true);
      })
      .catch((err) => alert('Login failed'));
  };

  // Submit or update data
  const handleSubmit = () => {
    const url = editId ? `${API_URL}/data/${editId}` : `${API_URL}/data`;
    const method = editId ? 'put' : 'post';

    axios[method](url, formInput, { headers: { Authorization: token } })
      .then((res) => {
        setFormData((prev) =>
          editId ? prev.map((item) => (item.id === editId ? res.data : item)) : [...prev, res.data]
        );
        setFormInput({ name: '', email: '', message: '' });
        setEditId(null);
      })
      .catch((err) => console.error(err));
  };

  // Delete data
  const handleDelete = (id) => {
    axios
      .delete(`${API_URL}/data/${id}`, { headers: { Authorization: token } })
      .then(() => setFormData((prev) => prev.filter((item) => item.id !== id)))
      .catch((err) => console.error(err));
  };

  // Edit data
  const handleEdit = (item) => {
    setFormInput({ name: item.name, email: item.email, message: item.message });
    setEditId(item.id);
  };

  return (
    <div>
      {!isAdmin ? (
        <div>
          <h2>Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={loginData.username}
            onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Form</h2>
          <input
            type="text"
            placeholder="Name"
            value={formInput.name}
            onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={formInput.email}
            onChange={(e) => setFormInput({ ...formInput, email: e.target.value })}
          />
          <textarea
            placeholder="Message"
            value={formInput.message}
            onChange={(e) => setFormInput({ ...formInput, message: e.target.value })}
          />
          <button onClick={handleSubmit}>{editId ? 'Update' : 'Submit'}</button>

          <h2>Submitted Data</h2>
          <ul>
            {formData.map((item) => (
              <li key={item.id}>
                <p>Name: {item.name}</p>
                <p>Email: {item.email}</p>
                <p>Message: {item.message}</p>
                <button onClick={() => handleEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
