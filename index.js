const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 5000;

// MySQL connection
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    throw err;
  }
  console.log('Connected to MySQL');
});

// Multer setup for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });


app.use((req, res, next) => {
    const allowedOrigins = ['https://www.dslib.com', 'http://localhost:19006','https://dropshippingtool.vercel.app'];
    const origin = req.headers.origin;
  
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
// Express middleware to parse JSON
app.use(express.json());

// Routes
app.post('/upload', upload.single('photo'), (req, res) => {
  const { name,code, groupbc, rrnumber,cast,mobileno,id,photo } = req.body;
  //console.log("photo",photo)
  //console.log(req.body)
 // const imageData = req.file.buffer;
 const imageData=photo[0]

  const sql = "INSERT INTO master (name,photo,code,groupbc,rrnumber,cast,mobileno,id) VALUES (?, ?,?,?,?,?,?,?)";
  db.query(sql, [name, imageData,code,groupbc,rrnumber,cast,mobileno,id], (err, result) => {
    if (err) {
      console.error('MySQL insertion error:', err);
      res.status(500).send('Error storing data in the database');
    } else {
          res.status(201).json({ message: "save master data successfully", success: true });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
