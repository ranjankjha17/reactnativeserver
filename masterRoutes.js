const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const getConnection = require('./database');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY


// Middleware to authenticate JWT
// const authenticateJWT = (req, res, next) => {
//   const token = req.header('Authorization');

//   if (!token) {
//     return res.sendStatus(401); // Unauthorized
//   }

//   jwt.verify(token, secretKey, (err, user) => {
//     if (err) {
//       return res.sendStatus(403); // Forbidden
//     }

//     req.user = user;
//     next();
//   });
// };


// router.post("/master",upload.single('photo'), async (req, res) => {
//   const { code, groupbc, rrnumber,name,cast,mobileno,id} = req.body;
//  console.log(req.file)
//  console.log(req.body)
//  const photo = req.file.buffer;
//  console.log('photo',photo)

//   try {
//     getConnection((err, connection) => {
//       if (err) {
//         console.error("Error getting database connection:", err);
//         return res.status(500).json({ error: "Failed to save data" });
//       }
//         const insertUserQuery = "INSERT INTO master (code, groupbc, rrnumber,name,cast,mobileno,id,photo) VALUES (?, ?,?,?,?,?,?,?)";
//         connection.query(insertUserQuery, [code, groupbc, rrnumber,name,cast,mobileno,id,photo], (error, result) => {
//           connection.release();
//           if (error) {
//             return res.status(500).json({ error: "Failed to register user" });
//           }
//           res.status(201).json({ message: "save master data successfully", success: true });
//         });
//       });
//   } catch (error) {
//     console.error("Error during save data:", error);
//     return res.status(500).json({ error: "Failed to save data" });
//   }
// });

router.post("/master", async (req, res) => {
  const { code, groupbc, rrnumber,name,cast,mobileno,id,photo} = req.body;
  try {
    getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        return res.status(500).json({ error: "Failed to save data" });
      }
        const insertUserQuery = "INSERT INTO master (code, groupbc, rrnumber,name,cast,mobileno,id,photo) VALUES (?, ?,?,?,?,?,?,?)";
        connection.query(insertUserQuery, [code, groupbc, rrnumber,name,cast,mobileno,id,photo], (error, result) => {
          connection.release();
          if (error) {
            return res.status(500).json({ error: "Failed to register user" });
          }
          res.status(201).json({ message: "save master data successfully", success: true });
        });
      });
  } catch (error) {
    console.error("Error during save data:", error);
    return res.status(500).json({ error: "Failed to save data" });
  }
});


module.exports = router;