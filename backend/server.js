const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = 5002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Dummy data and user setup
const users = [{ username: 'admin', password: bcrypt.hashSync('password', 8) }];
let formData = [];

// JWT Secret
const SECRET = 'secretkey';

// Authenticate user and generate token
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware for verifying token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.username = decoded.username;
    next();
  });
};

// CRUD operations
app.get('/api/data', verifyToken, (req, res) => {
  res.json(formData);
});

app.post('/api/data', verifyToken, (req, res) => {
  const { name, email, message } = req.body;
  const newEntry = { id: formData.length + 1, name, email, message };
  formData.push(newEntry);
  res.status(201).json(newEntry);
});

app.put('/api/data/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { name, email, message } = req.body;

  const index = formData.findIndex((item) => item.id === parseInt(id));
  if (index === -1) return res.status(404).json({ message: 'Item not found' });

  formData[index] = { id: parseInt(id), name, email, message };
  res.json(formData[index]);
});

app.delete('/api/data/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  const index = formData.findIndex((item) => item.id === parseInt(id));
  if (index === -1) return res.status(404).json({ message: 'Item not found' });

  const deletedItem = formData.splice(index, 1);
  res.json({ message: 'Item deleted successfully', item: deletedItem[0] });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
