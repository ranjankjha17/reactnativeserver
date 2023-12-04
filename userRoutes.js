const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const getConnection = require('./database');
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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  try {
    getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        return res.status(500).json({ error: "Failed to login" });
      }
      const getUserQuery = "SELECT * FROM drop_users WHERE email = ?";
      connection.query(getUserQuery, [email], async (error, results) => {
        connection.release();
        if (error) {
          return res.status(500).json({ error: "Failed to login" });
        }
        if (results.length === 0) {
          return res.status(401).json({ error: "User not found" });
        }
        const user = results[0];
        const currentDate = new Date();
        const subscriptionEnd = new Date(user.subscription_end);

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch && currentDate < subscriptionEnd) {
          const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '6h' });
          return res.status(200).json({ message: "User logged in successfully", success: true, token });
        } else {
          return res.status(401).json({ error: "Incorrect password" });
        }
      });
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/register", async (req, res) => {
  const { username, email, password,orderID } = req.body;
  // Set subscription details
  const subscriptionStart = new Date();
  const subscriptionEnd = new Date();
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // One month subscription

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }
    getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        return res.status(500).json({ error: "Failed to register user" });
      }
      const checkUserQuery = "SELECT * FROM drop_users WHERE email = ?";
      connection.query(checkUserQuery, [email], async (error, results) => {
        if (error) {
          connection.release();
          return res.status(500).json({ error: "Failed to register user" });
        }
        // if (results.length > 0) {
        //     connection.release();
        //     return res.status(409).json({ error: "User already exists" });
        // }
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertUserQuery = "INSERT INTO drop_users (username,email, password,subscription_start,subscription_end,orderid) VALUES (?, ?,?,?,?,?)";
        connection.query(insertUserQuery, [username, email, hashedPassword, subscriptionStart, subscriptionEnd,orderID], (error, result) => {
          connection.release();
          if (error) {
            return res.status(500).json({ error: "Failed to register user" });
          }
          res.status(201).json({ message: "User registered successfully", success: true });
        });
      });
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
});


router.get('/check-email', (req, res) => {
  const email = req.query.email;
  getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).json({ error: "Failed to register user" });
    }

    connection.query('SELECT COUNT(*) as count FROM drop_users WHERE email = ?', [email], (error, results) => {
      connection.release();

      if (error) {
        console.error("Error executing database query:", error);
        return res.status(500).json({ error: "Database error" });
      }

      try {
        const isEmailTaken = results[0].count > 0;
        res.json({ isEmailTaken });
      } catch (err) {
        console.error("Error processing database results:", err);
        res.status(500).json({ error: "Result processing error" });
      }
    });
  });
});


// API to get users with name and email
router.get("/users", authenticateJWT, (req, res) => {
  try {
    getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        return res.status(500).json({ error: "Failed to fetch users" });
      }

      const getUsersQuery = "SELECT username, email FROM drop_users";

      connection.query(getUsersQuery, (error, results) => {
        connection.release();

        if (error) {
          return res.status(500).json({ error: "Failed to fetch users" });
        }

        res.json({ users: results });
      });
    });
  } catch (error) {
    console.error("Error during fetch users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

//   router.get('/protected', authenticateJWT, (req, res) => {
//     const { role } = req.user;

//     if (role === 'admin') {
//       res.json({ message: 'Admin access granted.', user: req.user });
//     } else {
//       res.json({ message: 'Regular user access granted.', user: req.user });
//     }
//   });


module.exports = router;