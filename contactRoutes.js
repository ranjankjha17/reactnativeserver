const express = require('express');
const router = express.Router();
const getConnection = require('./database');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
  
    if (!token) {
      return res.sendStatus(401); // Unauthorized
    }
  
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }
  
      req.user = user;
      next();
    });
  };

router.post("/contact", async (req, res) => {
    const { name, email, subject,message } = req.body;
    if (!name || !email || !message || !subject) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
    
    console.log('email',email)
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        
        if (!message || message.length < 10) {
            return res.status(400).json({ error: "Message must be at least 10 characters long" });
        }
        getConnection((err, connection) => {
            if (err) {
                console.error("Error getting database connection:", err);
                return res.status(500).json({ error: "Failed to submit message" });
            }                
            const insertUserQuery = "INSERT INTO drop_contact (name,email, subject,message) VALUES (?, ?,?,?)";
                connection.query(insertUserQuery, [name, email,subject,message], (error, result) => {
                    connection.release();
                    if (error) {
                        return res.status(500).json({ error: "Failed to send message" });
                    }
                    res.status(201).json({ message: "Send Message Successfully", success: true });
                });            
        });
    } catch (error) {
        console.error("Error during send message:", error);
        return res.status(500).json({ error: "Failed to send message" });
    }
});

// API to get users with name and email
router.get("/contact-details", authenticateJWT,(req, res) => {
    try {
      getConnection((err, connection) => {
        if (err) {
          console.error("Error getting database connection:", err);
          return res.status(500).json({ error: "Failed to fetch contacts" });
        }
  
        const getUsersQuery = "SELECT name, email,subject,message FROM drop_contact";
  
        connection.query(getUsersQuery, (error, results) => {
          connection.release();
  
          if (error) {
            return res.status(500).json({ error: "Failed to fetch contacts" });
          }
  
          res.json({ contacts: results });
        });
      });
    } catch (error) {
      console.error("Error during fetch users:", error);
      return res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });



module.exports = router;