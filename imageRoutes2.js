const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const getConnection = require('./database');

//Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
}).single('photo');



// router.post('/upload', (req, res) => {
//     upload(req, res, (err) => {
//       if (err) {
//         console.error(err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         // File uploaded successfully
//         res.send('File uploaded!');
//       }
//     });
//   });
  
// Handle image upload

// router.post('/upload', async (req, res) => {
//   try {
//     const connection = await getConnection();
// //console.log(connection)
//     await upload(req, res, async (err) => {
//       if (err) {
//         console.error('Error uploading file:', err);
//         return res.status(500).send('Internal Server Error');
//       }

//       if (!req.file) {
//         console.error('No file uploaded.');
//         return res.status(400).send('No file uploaded.');
//       }

//       const imagePath = req.file.path;
//       const imageBuffer = fs.readFileSync(imagePath);

//       const query = 'INSERT INTO image (photo) VALUES (?)';

//       await connection.query(query, [imageBuffer]);

//       connection.release();
//       res.send('File uploaded and saved to MySQL!');
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).send('Internal Server Error');
//   }
// });

// router.post('/upload', async (req, res) => {
//   const { code, groupbc, rrnumber,name,cast,mobileno,id} = req.body;

//   try {
//     const connection = await getConnection();
// //console.log(connection)
//     await upload(req, res, async (err) => {
//       if (err) {
//         console.error('Error uploading file:', err);
//         return res.status(500).send('Internal Server Error');
//       }

//       if (!req.file) {
//         console.error('No file uploaded.');
//         return res.status(400).send('No file uploaded.');
//       }

//       const imagePath = req.file.path;
//       const imageBuffer = fs.readFileSync(imagePath);

//       const query = "INSERT INTO master (code, groupbc, rrnumber,name,cast,mobileno,id,photo) VALUES (?, ?,?,?,?,?,?,?)";

//       await connection.query(query, [code, groupbc, rrnumber,name,cast,mobileno,id,imageBuffer]);

//       connection.release();
//       res.send('File uploaded and saved to MySQL!');
//     });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).send('Internal Server Error');
//   }
// });

router.post('/upload', async (req, res) => {
  const { code, groupbc, rrnumber, name, cast, mobileno, id } = req.body;

  try {
    const connection = await getConnection();

    upload(req, res, (err) => {
      if (err) {
        console.error('Error uploading file:', err);
        connection.release();
        return res.status(500).send('Internal Server Error');
      }

      if (!req.file) {
        console.error('No file uploaded.');
        connection.release();
        return res.status(400).send('No file uploaded.');
      }

      const imagePath = req.file.path;
      const imageBuffer = fs.readFileSync(imagePath);

      const query = "INSERT INTO master (code, groupbc, rrnumber, name, cast, mobileno, id, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

      connection.query(query, [code, groupbc, rrnumber, name, cast, mobileno, id, imageBuffer], (queryError, results) => {
        connection.release();

        if (queryError) {
          console.error('Error inserting data into MySQL:', queryError);
          return res.status(500).send('Internal Server Error');
        }

        res.send('File uploaded and saved to MySQL!');
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


module.exports=router