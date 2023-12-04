const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const getConnection = require('./database');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
}).single('image');

router.post('/upload', async (req, res) => {
  try {
    await upload(req, res);
    // console.log('req',req)
    if (!req.file) {
      throw new Error('No file uploaded.');
    }

    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);

    const query = 'INSERT INTO master (photo) VALUES (?)';
    const connection = await getConnection();
    await connection.query(query, [imageBuffer]);
    connection.release();

    res.send('File uploaded and saved to MySQL!');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  } finally {
    await connection.release();

  }

});

module.exports = router;
