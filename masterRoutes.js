const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const jwt = require('jsonwebtoken');
const secretKey = "8794587125463258921456375"

const dbService = require('./dbService');


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

// router.post("/master", async (req, res) => {
//   const { code, groupbc, rrnumber,name,cast,mobileno,id,photo} = req.body;
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

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const connection = await dbService.getConnection();

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const results = await executeQuery(connection, query, [username, password]);
    connection.release()

    if (results.length > 0) {
      const user = results[0]; // Assuming only one user is returned
      const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '6h' });

      return res.status(200).json({ 
        message: "User logged in successfully", 
        username: user.username, 
        permission: user.permission, // Include usertype in the response
        company:user.company,
        success: true, 
        token 
      });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const executeQuery = (connection, query, values) => {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (err, results) => {
      if (err) {
        console.error('MySQL query error: ' + err.stack);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};



router.post("/upload", upload.single('photo'), async (req, res) => {
  const { code, groupbc, rrnumber, name, cast, mobileno, id, photo } = req.body;
  // const imageData = photo[0];
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imageData = req.file.buffer; // Image buffer from Multer

  try {
    const connection = await dbService.getConnection();

    const insertUserQuery = "INSERT INTO master (code, groupbc, rrnumber, name, cast, mobileno, id, photo) VALUES (?, ?,?,?,?,?,?,?)";
    const result = await dbService.query(insertUserQuery, [code, groupbc, rrnumber, name, cast, mobileno, id, imageData]);

    connection.release();
    res.status(201).json({ message: "save master data successfully", success: true });
  } catch (error) {
    console.error("Error during save data:", error);
    return res.status(500).json({ error: "Failed to save data" });
  }
});


router.post('/create-group', async (req, res) => {
  const { groupName, members, amount } = req.body;

  try {
    const connection = await dbService.getConnection();
    connection.release();

    const sql = "INSERT INTO `group` (groupName, members, amount) VALUES (?, ?, ?)";
    const result = await dbService.query(sql, [groupName, members, amount]);

    if (result.affectedRows === 1) {
      return res.status(201).json({ message: "created group successfully", success: true });
    } else {
      throw new Error('Failed to create group');
    }
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).json({ error: 'Error storing data in the database' });
  }
});


router.post('/create-form2', async (req, res) => {
  try {
    const { date, group, name, bcAmount, intNo, percentage, amount, bc_payment, c_code, gsum, user } = req.body;
    // console.log(req.body);

    const connection = await dbService.getConnection();

    const insertQuery = "INSERT INTO form2 (date, group_, name, bcamount, intNo, percentage, amount,bc_payment,c_code,gsum,user) VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?,?)";
    await dbService.query(insertQuery, [date, group, name, bcAmount, intNo, percentage, amount, bc_payment, c_code, gsum, user]);

    connection.release();
    res.status(201).json({ message: "Save form2 data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});

router.post('/transection', async (req, res) => {
  try {
    const { code, name, transectionType, paymentMode, amount, mobilenumber } = req.body;
    //console.log(code)
    let credit_amount = 0
    let debit_amount = 0
    if (transectionType === 'Payment') {
      debit_amount = parseFloat(amount)
    } else {
      credit_amount = parseFloat(amount)
    }
    // console.log(req.body);

    const connection = await dbService.getConnection();

    const insertQuery = "INSERT INTO Transection (c_code,name,transection_type,credit_amount,debit_amount,mobilenumber,mode) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await dbService.query(insertQuery, [code, name, transectionType, credit_amount, debit_amount, mobilenumber, paymentMode]);

    connection.release();
    res.status(201).json({ message: "Save Transection data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});


router.get('/getimage', async (req, res) => {
  try {

    const connection = await dbService.getConnection();

    const insertQuery = "select * from master";
    const results = await dbService.query(insertQuery);

    connection.release();
    res.json({ data: results });

    // res.status(201).json({ message: "Save form2 data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});

router.get('/get-group', async (req, res) => {
  try {

    const connection = await dbService.getConnection();

    const insertQuery = "select * from `group`";
    const results = await dbService.query(insertQuery);

    connection.release();
    res.json({ data: results, success: true });

    // res.status(201).json({ message: "Save form2 data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});

router.get('/get-code', async (req, res) => {
  try {

    const connection = await dbService.getConnection();

    const selectQuery = "SELECT MAX(CAST(code AS SIGNED)) AS maxCode FROM master";

    try {
      const results = await dbService.query(selectQuery);

      let nextCode;

      if (results.length > 0) {
        const maxCode = results[0].maxCode;
        nextCode = (maxCode !== null ? maxCode + 1 : 1).toString();
      } else {
        // If no records exist, start with '1' or any initial value you prefer
        nextCode = '1';
      }

      res.json({ data: nextCode });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      connection.release();
    }

    // res.status(201).json({ message: "Save form2 data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});

router.get('/get-intno', async (req, res) => {
  try {

    const connection = await dbService.getConnection();

    const selectQuery = "SELECT MAX(CAST(intNo AS SIGNED)) AS maxCode FROM form2";

    try {
      const results = await dbService.query(selectQuery);

      let nextCode;

      if (results.length > 0) {
        const maxCode = results[0].maxCode;
        nextCode = (maxCode !== null ? maxCode + 1 : 1).toString();
      } else {
        // If no records exist, start with '1' or any initial value you prefer
        nextCode = '1';
      }

      res.json({ data: nextCode });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      connection.release();
    }

    // res.status(201).json({ message: "Save form2 data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});


// router.post("/image", upload.single('photo'), async (req, res) => {
//   const {  photo } = req.body;
//  console.log("photo",photo)
//   const imageData = photo[0];
//   //console.log("imagedata",imageData)
//   try {
//     const connection = await dbService.getConnection();

//     const insertUserQuery = "INSERT INTO image (photo) VALUES (?)";
//     const result = await dbService.query(insertUserQuery, [photo]);

//     connection.release();
//     res.status(201).json({ message: "save image successfully", success: true });
//   } catch (error) {
//     console.error("Error during save data:", error);
//     return res.status(500).json({ error: "Failed to save data" });
//   }
// });


// router.post("/image", upload.single('photo'), async (req, res) => {
//   const {  photo } = req.body;
//  console.log("photo",photo)
//   // const imageData = photo[0];
//   // console.log("imagedata",imageData)
//   const imagePath = req.file.path;

//   // Read the image file
//   const imageBuffer = fs.readFileSync(imagePath);

//   try {
//     const connection = await dbService.getConnection();

//     const insertUserQuery = "INSERT INTO image (photo) VALUES (?)";
//     const result = await dbService.query(insertUserQuery, [imageBuffer]);

//     connection.release();
//     res.status(201).json({ message: "save image successfully", success: true });
//   } catch (error) {
//     console.error("Error during save data:", error);
//     return res.status(500).json({ error: "Failed to save data" });
//   }
// });

module.exports = router;