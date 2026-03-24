const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs").promises;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use PostgreSQL if DATABASE_URL is set; otherwise fall back to local storage.
const useDatabase = Boolean(process.env.DATABASE_URL);
let pool;

if (useDatabase) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  console.warn("DATABASE_URL not set; contact messages will be stored locally in messages.json.");
}


// Serve frontend files
app.use(express.static(path.join(__dirname, "frontend")));


// Homepage route
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
    if (useDatabase) {
      await pool.query(
        "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)",
        [name, email, message]
      );

      res.send("Message saved successfully");
    } else {
      // Fallback: store messages locally in a JSON file so the contact form works without a database.
      const filePath = path.join(__dirname, "messages.json");
      let existing = [];

      try {
        const raw = await fs.readFile(filePath, "utf8");
        existing = JSON.parse(raw);
      } catch (readErr) {
        if (readErr.code !== "ENOENT") throw readErr;
      }

      existing.push({
        name,
        email,
        message,
        createdAt: new Date().toISOString()
      });

      await fs.writeFile(filePath, JSON.stringify(existing, null, 2), "utf8");
      res.send("Message saved locally (no database configured).");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Storage error");
  }
});


// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});