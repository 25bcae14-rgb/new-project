const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("../frontend."));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Babar@120765",
  database: "portfolio"
});

db.connect(err => {
  if(err){
    console.log("Database error");
  } else {
    console.log("MySQL connected");
  }
});

app.post("/contact",(req,res)=>{

  const {name,email,message} = req.body;

  console.log("Received message:", {name, email, message});

  const sql = "INSERT INTO messages (name,email,message) VALUES (?,?,?)";

  db.query(sql,[name,email,message],(err,result)=>{

    if(err){
      console.error("Error inserting message:", err);
      res.status(500).send("Error saving message");
    }else{
      console.log("Message inserted successfully, ID:", result.insertId);
      res.send("Message saved successfully");
    }

  });

});

app.listen(3000,()=>{
  console.log("Server running on port 3000");
});