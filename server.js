const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Temporary in-memory storage for users
let users = []; // Each user: { id, name, email, role }

// Routes
// 1️⃣ Get all users
app.get('/users', (req, res) => {
  res.json(users);
});

//1.1 Get user by id
app.get('/users/:id',(req,res)=>
{
const {id} = req.params;
const user = users.find(u => u.id == id);
if(!user) return res.status(404).json({message: "User not found"});
res.json(user);

});

// 2️⃣ Add a user
app.post('/users', (req, res) => {
  const { name, email, role } = req.body;
  const id = Date.now(); // simple unique ID
  const newUser = { id, name, email, role };
  users.push(newUser);
  res.json(newUser);
});

// 3️⃣ Update a user
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const user = users.find(u => u.id == id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.name = name;
  user.email = email;
  user.role = role;

  res.json(user);
});

// 4️⃣ Delete a user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  users = users.filter(u => u.id != id);
  res.json({ message: "User deleted" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
