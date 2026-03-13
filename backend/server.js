require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serves frontend files

// MySQL connection (Render database)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// connect to database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("MySQL connected successfully");
  }
});

// contact form API
app.post("/contact", (req, res) => {

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send("All fields are required");
  }

  const sql = "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)";

  db.query(sql, [name, email, message], (err, result) => {

    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Error saving message");
    }

    res.send("Message saved successfully");

  });

});

// server port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});