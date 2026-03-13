require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static("frontend")); // serve frontend

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

// test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
  } else {
    console.log("PostgreSQL connected successfully");
    release();
  }
});

// contact form API
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("All fields are required");
  }

  try {
    await pool.query(
      "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)",
      [name, email, message]
    );

    res.send("Message saved successfully");

  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Error saving message");
  }
});

// server port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});