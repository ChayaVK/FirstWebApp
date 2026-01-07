const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');        // <-- add this
require('dotenv').config();            // <-- add this

const app = express();
const PORT = process.env.PORT || 3000;

// CORS settings
/*
const corsOptions = {
  origin: ["https://chayavk.github.io", "http://localhost:3000", "http://127.0.0.1:5500"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
};
app.use(cors(corsOptions));
*/
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://chayavk.github.io",
      "http://localhost:3000",
      "http://127.0.0.1:5500"
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));


// Middleware
app.use(bodyParser.json());

// ----------------- PostgreSQL Setup -----------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // allows Node to connect without verifying certificate
  },
});

// Optional: test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('DB connection error:', err);
  else console.log('Postgres connected:', res.rows[0]);
});


// Routes
// 1️⃣ Get all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});


//1.1 Get user by id
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});


// 2️⃣ Add a user
app.post('/users', async (req, res) => {
  try {
    const { name, email, mobile, role } = req.body;
    const result = await pool.query(
      'INSERT INTO users (name, email, mobile, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, mobile, role]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});


// 3️⃣ Update a user
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, role } = req.body;

    const result = await pool.query(
      'UPDATE users SET name=$1, email=$2, mobile=$3, role=$4 WHERE id=$5 RETURNING *',
      [name, email, mobile, role, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});


// 4️⃣ Delete a user
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

