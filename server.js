const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Serve frontend files
app.use(express.static(path.join(__dirname, "frontend")));

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Contact API
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