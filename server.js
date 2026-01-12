const express = require('express');
const cors = require('cors');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const { Pool } = require('pg');        
require('dotenv').config(); 
          

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); 
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
  allowedHeaders: ["Content-Type", "Authorization"]
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

//Add auth middleware
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Unauthorized" });

  try {
    jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}


// Routes
//Singup API
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Signup body:", req.body);

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO auth_users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hash]
    );
    
    res.status(201).json({ message: "Signup successful" });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
    console.log(req.body);
    console.log(res.body);
  }
});

//Login API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  const result = await pool.query(
    "SELECT * FROM auth_users WHERE email=$1",
    [email]
  );

  if (result.rows.length === 0)
    return res.status(401).json({ message: "Invalid credentials" });

  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
console.log("Login body:", req.body);
console.log("User from DB:", result.rows[0]);
console.log("Password match:", isMatch);
  
  if (!isMatch)
    return res.status(401).json({ message: "Invalid credentials" });
  
  const token = jwt.sign(
    { id: user.id , name: user.name},
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token,name: user.name });
});

//Password Reset API
app.post("/reset-password", async (req, res) => {
  try {
    const { email, password, confirmpassword } = req.body;

    console.log("Signup body:", req.body);

    const hash = await bcrypt.hash(password, 10);
    console.log("Email :",email);
    console.log("password :",hash);
    const result = await pool.query(
      "UPDATE auth_users set password=$2 where email=$1",
      [email,hash]
    );

     if (result.rowCount === 0) {
      return res.status(404).json({ message: "User does not exist" });
    }
    res.status(201).json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ message: "Reset failed" });
    console.log(req.body);
    console.log(res.body);
  }
});
// 1️⃣ Get all users
app.get('/users',authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});


//1.1 Get user by id
app.get('/users/:id',authMiddleware, async (req, res) => {
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
app.post('/users',authMiddleware, async (req, res) => {
  try {
    const { name, gender, email, mobile, role } = req.body;
    const result = await pool.query(
      'INSERT INTO users (name, gender, email, mobile, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, gender, email, mobile, role]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});


// 3️⃣ Update a user
app.put('/users/:id',authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender,email, mobile, role } = req.body;

    const result = await pool.query(
      'UPDATE users SET name=$1, gender=$2, email=$3, mobile=$4, role=$5 WHERE id=$5 RETURNING *',
      [name, gender, email, mobile, role, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});


// 4️⃣ Delete a user
app.delete('/users/:id', authMiddleware,async (req, res) => {
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

