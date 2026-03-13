require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// PostgreSQL connection (Render database)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("Portfolio backend running 🚀");
});

// Contact form API
app.post("/contact", async (req, res) => {

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("All fields are required");
  }

  try {

    const query = `
      INSERT INTO messages (name, email, message)
      VALUES ($1, $2, $3)
    `;

    await pool.query(query, [name, email, message]);

    res.send("Message saved successfully");

  } catch (error) {

    console.error("Database error:", error);
    res.status(500).send("Error saving message");

  }

});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});