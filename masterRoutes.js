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
  const { groupName, members, amount, company } = req.body;

  try {
    const connection = await dbService.getConnection();
    connection.release();

    const sql = "INSERT INTO `group` (groupName, members, amount,company) VALUES (?, ?, ?,?)";
    const result = await dbService.query(sql, [groupName, members, amount, company]);

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
    const { date, group, name, bcAmount, intNo, percentage, amount, bc_payment, c_code, gsum, user, company } = req.body;
    // console.log(req.body);
    const payment="pending"
    const pay_date=''
    const connection = await dbService.getConnection();

    const insertQuery = "INSERT INTO form2 (date, group_, name, bcamount, intNo, percentage, amount,bc_payment,c_code,gsum,user,company,payment,pay_date) VALUES (?,?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)";
    await dbService.query(insertQuery, [date, group, name, bcAmount, intNo, percentage, amount, bc_payment, c_code, gsum, user, company,payment,pay_date]);

    connection.release();
    res.status(201).json({ message: "Save form2 data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});

router.post('/transection', async (req, res) => {
  try {
    const { code, name, transectionType, paymentMode, amount, mobilenumber, company, group_, username, usertype } = req.body;
    //console.log(code)
    let credit_amount = 0
    let debit_amount = 0
    if (transectionType === 'Payment') {
      debit_amount = parseFloat(amount)
    } else {
      credit_amount = parseFloat(amount)
    }
    // console.log(req.body);
    let type = ''
    if (usertype === 'admin') {
      type = 'credit'
    } else {
      type = 'rc'
    }

    const connection = await dbService.getConnection();

    const insertQuery = "INSERT INTO Transection (c_code,name,transection_type,credit_amount,debit_amount,mobilenumber,mode,company,group_,type,user,user_type) VALUES (?,?,?,?,?,?, ?, ?, ?, ?, ?, ?)";
    await dbService.query(insertQuery, [code, name, transectionType, credit_amount, debit_amount, mobilenumber, paymentMode, company, group_, type, username, usertype]);

    connection.release();
    res.status(201).json({ message: "Save Transection data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});

router.put('/update-transaction-type', async (req, res) => {
  const { trans_ids, type,sheetnumber } = req.body;
//console.log(trans_ids,type)
  if (!trans_ids || !Array.isArray(trans_ids) || trans_ids.length === 0) {
    return res.status(400).json({ error: 'Invalid or missing trans_ids' });
  }

  try {
    const connection = await dbService.getConnection();

    // Construct the SQL query with multiple trans_id values using IN clause
    const query = `
      UPDATE Transection
      SET type = ?, sheetnumber=?
      WHERE tran_id IN (?)`;

    // Execute the query with trans_ids and type as parameters
    const result = await dbService.query(query, [type,sheetnumber, trans_ids]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transactions not found' });
    }

    res.status(200).json({ message: 'Transaction types updated successfully',success: true });
  } catch (error) {
    console.error('Error updating transaction types:', error);
    res.status(500).json({ error: 'Error updating transaction types' });
  }
});

router.get('/get-transection', async (req, res) => {
  const user = req.query.user;
  //console.log(user)
  // Check if user parameter is provided
  if (!user) {
    return res.status(400).json({ error: 'User parameter is missing' });
  }
  try {
    const connection = await dbService.getConnection();
    const query = `
      SELECT * 
      FROM 
        Transection
      WHERE 
        user_type = 'user' AND
        user = ? AND
        type = 'rc'`;
    const results = await dbService.query(query, [user]);

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No transactions found for the given user' });
    }

    connection.release();
    res.json({ data: results });
  } catch (error) {
    console.error('Error retrieving data from the database:', error);
    res.status(500).json({ error: 'Error retrieving data from the database' });
  }
});

router.get('/get-transection-alldata', async (req, res) => {
  try {
    const connection = await dbService.getConnection();
    const query = `
      SELECT * 
      FROM 
        Transection`;
    const results = await dbService.query(query);

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No transactions found' });
    }

    connection.release();
    res.json({ data: results });
  } catch (error) {
    console.error('Error retrieving data from the database:', error);
    res.status(500).json({ error: 'Error retrieving data from the database' });
  }
});


router.get('/get-calculate-amountOfUser', async (req, res) => {
  const user = req.query.user;
  //console.log("user", user);

  try {
    const connection = await dbService.getConnection();
    const query = `
      SELECT 
        IFNULL(SUM(credit_amount), 0) - IFNULL(SUM(debit_amount), 0) AS total_amount 
      FROM 
        Transection
      WHERE 
        user_type = 'user' AND
        user = ? AND
        type = 'rc'`;

    const results = await dbService.query(query, [user]);

    if (!results || !results.length || !results[0].total_amount) {
      return res.status(404).json({ error: 'No transactions found for the given user' });
    }

    const { total_amount } = results[0];

    connection.release();
    res.json({ data: total_amount });
  } catch (error) {
    console.error('Error retrieving data from the database:', error);
    res.status(500).json({ error: 'Error retrieving data from the database' });
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

router.get('/get-client-amount', async (req, res) => {
  try {

    const connection = await dbService.getConnection();

    const insertQuery = "select * from CombinedViewForClientAmount";
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