const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const jwt = require('jsonwebtoken');
const secretKey = "8794587125463258921456375"

const dbService = require('./dbService');



router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const connection = await dbService.getConnection();

    const query = 'SELECT * FROM group_users WHERE username = ? AND password = ?';
    const results = await executeQuery(connection, query, [username, password]);
    connection.release()

    if (results.length > 0) {
      const user = results[0]; // Assuming only one user is returned
      const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '6h' });

      return res.status(200).json({
        message: "User logged in successfully",
        username: user.username,
        permission: user.permission, // Include usertype in the response
        company: user.company,
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



// router.post("/upload", upload.single('photo'), async (req, res) => {
//   const { code, groupbc, rrnumber, name, cast, mobileno, id, photo,company } = req.body;
//   // const imageData = photo[0];
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   const imageData = req.file.buffer; // Image buffer from Multer

//   try {
//     const connection = await dbService.getConnection();

//     const insertUserQuery = "INSERT INTO master (code, groupbc, rrnumber, name, cast, mobileno, id, photo,company) VALUES (?, ?,?,?,?,?,?,?,?)";
//     const result = await dbService.query(insertUserQuery, [code, groupbc, rrnumber, name, cast, mobileno, id, imageData,company]);

//     connection.release();
//     res.status(201).json({ message: "save master data successfully", success: true });
//   } catch (error) {
//     console.error("Error during save data:", error);
//     return res.status(500).json({ error: "Failed to save data" });
//   }
// });

router.post("/upload", upload.single('photo'), async (req, res) => {
  const { code, groupbc, rrnumber, name, cast, mobileno, id, photo, company } = req.body;

  // Check if req.file exists (i.e., if photo is uploaded)
  if (req.file) {
    const imageData = req.file.buffer; // Image buffer from Multer
    try {
      const connection = await dbService.getConnection();
      const insertUserQuery = "INSERT INTO master (code, groupbc, rrnumber, name, cast, mobileno, id, photo, company) VALUES (?, ?,?,?,?,?,?,?,?)";
      const result = await dbService.query(insertUserQuery, [code, groupbc, rrnumber, name, cast, mobileno, id, imageData, company]);
      connection.release();
      return res.status(201).json({ message: "save master data successfully", success: true });
    } catch (error) {
      console.error("Error during save data:", error);
      return res.status(500).json({ error: "Failed to save data" });
    }
  } else {
    // Image file is not present, proceed without saving photo
    try {
      const connection = await dbService.getConnection();
      const insertUserQuery = "INSERT INTO master (code, groupbc, rrnumber, name, cast, mobileno, id, company) VALUES (?, ?,?,?,?,?,?,?)";
      const result = await dbService.query(insertUserQuery, [code, groupbc, rrnumber, name, cast, mobileno, id, company]);
      connection.release();
      return res.status(201).json({ message: "save master data successfully", success: true });
    } catch (error) {
      console.error("Error during save data:", error);
      return res.status(500).json({ error: "Failed to save data" });
    }
  }
});


router.post('/create-group', async (req, res) => {
  const { groupName, members, amount,company } = req.body;

  try {
    const connection = await dbService.getConnection();
    connection.release();

    const sql = "INSERT INTO `group` (groupName, members, amount,company) VALUES (?, ?, ?,?)";
    const result = await dbService.query(sql, [groupName, members, amount,company]);

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
    const { date, group, name, bcAmount, intNo, percentage, amount, bc_payment, c_code, gsum, user,company } = req.body;
    // console.log(req.body);

    const connection = await dbService.getConnection();

    const insertQuery = "INSERT INTO form2 (date, group_, name, bcamount, intNo, percentage, amount,bc_payment,c_code,gsum,user,company) VALUES (?,?, ?, ?, ?, ?, ?, ?,?,?,?,?)";
    await dbService.query(insertQuery, [date, group, name, bcAmount, intNo, percentage, amount, bc_payment, c_code, gsum, user,company]);

    connection.release();
    res.status(201).json({ message: "Save form2 data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});

router.post('/transection', async (req, res) => {
  try {
    const { code, name, transectionType, paymentMode, amount, mobilenumber,company,group_ } = req.body;
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

    const insertQuery = "INSERT INTO Transection (c_code,name,transection_type,credit_amount,debit_amount,mobilenumber,mode,company,group_) VALUES (?,?,?, ?, ?, ?, ?, ?, ?)";
    await dbService.query(insertQuery, [code, name, transectionType, credit_amount, debit_amount, mobilenumber, paymentMode,company,group_]);

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
router.get('/get-auction', async (req, res) => {
  try {

    const connection = await dbService.getConnection();

    const insertQuery = "select * from form2";
    const results = await dbService.query(insertQuery);

    connection.release();
    res.json({ data: results, success: true });

    // res.status(201).json({ message: "Save form2 data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});

// router.get('/get-code', async (req, res) => {
//   try {

//     const connection = await dbService.getConnection();

//     const selectQuery = "SELECT MAX(CAST(code AS SIGNED)) AS maxCode FROM master";

//     try {
//       const results = await dbService.query(selectQuery);

//       let nextCode;

//       if (results.length > 0) {
//         const maxCode = results[0].maxCode;
//         nextCode = (maxCode !== null ? maxCode + 1 : 1).toString();
//       } else {
//         // If no records exist, start with '1' or any initial value you prefer
//         nextCode = '1';
//       }

//       res.json({ data: nextCode });
//     } catch (error) {
//       console.error('Error:', error.message);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//       connection.release();
//     }

//     // res.status(201).json({ message: "Save form2 data successfully", success: true });
//   } catch (error) {
//     console.error('Error storing data in the database:', error);
//     res.status(500).send('Error storing data in the database');
//   }
// });

router.get('/get-code', async (req, res) => {
  try {
    const connection = await dbService.getConnection();

    const selectQuery = "SELECT MAX(CAST(code AS SIGNED)) AS maxCode FROM master WHERE company = ?";

    try {
      // Assuming you're passing company name in the request query
      const company = req.query.company;

      const results = await dbService.query(selectQuery, [company]);

      let nextCode;

      if (results.length > 0) {
        const maxCode = results[0].maxCode;
        nextCode = (maxCode !== null ? maxCode + 1 : 1).toString();
      } else {
        // If no records exist for the company, start with '1' or any initial value you prefer
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




module.exports = router;