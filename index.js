const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;
// app.use(cors({
//     origin: 'http://localhost:19006'
//   }));

// Express middleware to parse JSON
app.use(express.json());

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
    const allowedOrigins = [ 'http://localhost:19006','exp://172.24.0.168:8081'];
    const origin = req.headers.origin;
  
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  

// Routes
// app.post('/upload', upload.single('photo'), (req, res) => {
//   const { name,code, groupbc, rrnumber,cast,mobileno,id,photo } = req.body;
//   //console.log("photo",photo)
//   console.log(req.body)
//  // const imageData = req.file.buffer;
//  const imageData=photo[0]

//   const sql = "INSERT INTO master (name,photo,code,groupbc,rrnumber,cast,mobileno,id) VALUES (?, ?,?,?,?,?,?,?)";
//   db.query(sql, [name, imageData,code,groupbc,rrnumber,cast,mobileno,id], (err, result) => {
//     if (err) {
//       console.error('MySQL insertion error:', err);
//       res.status(500).send('Error storing data in the database');
//     } else {
//           res.status(201).json({ message: "save master data successfully", success: true });
//     }
//   });
// });


// app.post('/create-group', (req, res) => {
//     const { groupName,members,amount } = req.body;
  
//     const sql = "INSERT INTO group (groupName,members,amount) VALUES (?, ?,?)";
//     db.query(sql, [groupName,members,amount], (err, result) => {
//       if (err) {
//         console.error('MySQL insertion error:', err);
//         res.status(500).send('Error storing data in the database');
//       } else {
//             res.status(201).json({ message: "created group successfully", success: true });
//       }
//     });
//   });
  


app.post('/upload', upload.single('photo'), async (req, res) => {
    try {
      const { name, code, groupbc, rrnumber, cast, mobileno, id, photo } = req.body;
      const imageData = photo[0];
  
      const sql = "INSERT INTO master (name, photo, code, groupbc, rrnumber, cast, mobileno, id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      const result = await queryAsync(sql, [name, imageData, code, groupbc, rrnumber, cast, mobileno, id]);
  
      // Assuming queryAsync is a function to promisify the MySQL query
      // It should return a Promise that resolves with the result of the query
  
      res.status(201).json({ message: "save master data successfully", success: true });
    } catch (error) {
      console.error('Error storing data in the database:', error);
      res.status(500).send('Error storing data in the database');
    }
  });
  
  
app.post('/create-group', async (req, res) => {
    try {
      const { groupName, members, amount } = req.body;
  
      const sql = "INSERT INTO group (groupName, members, amount) VALUES (?, ?, ?)";
      const result = await queryAsync(sql, [groupName, members, amount]);
  
      // Assuming queryAsync is a function to promisify the MySQL query
      // It should return a Promise that resolves with the result of the query
  
      res.status(201).json({ message: "created group successfully", success: true });
    } catch (error) {
      console.error('Error storing data in the database:', error);
      res.status(500).send('Error storing data in the database');
    }
  });
  

  app.post('/create-form2', async (req, res) => {
    try {
      const { date, group, name,bcAmount,intNo,percentage,amount } = req.body;
      console.log(req.body)
  
      const sql = "INSERT INTO form2 (date, group_, name,bcamount,intNo,percentage,amount) VALUES (?, ?, ?,?,?,?,?)";
      const result = await queryAsync(sql, [date, group, name,bcAmount,intNo,percentage,amount]);
  
      // Assuming queryAsync is a function to promisify the MySQL query
      // It should return a Promise that resolves with the result of the query
  
      res.status(201).json({ message: "Save form2 data successfully", success: true });
    } catch (error) {
      console.error('Error storing data in the database:', error);
      res.status(500).send('Error storing data in the database');
    }
  });


  //Example function to promisify MySQL query
  
  function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
      db.query(sql, values, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
