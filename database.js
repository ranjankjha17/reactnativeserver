const mysql = require('mysql');
require('dotenv').config();

const dbConfig = {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
};
const pool = mysql.createPool(dbConfig);
// function getConnection(callback) {
//   pool.getConnection((err, connection) => {
//     if (err) {
//       console.error('Error getting MySQL connection:', err);
//       return callback(err);
//     }

//     callback(null, connection);

//   });
  
// }

const getConnection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(connection);
    });
  });
};


module.exports = getConnection;