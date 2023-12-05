const mysql = require('mysql');
const util = require('util');
require('dotenv').config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

const queryAsync = util.promisify(pool.query).bind(pool);

module.exports = {
  getConnection: () => {
    return util.promisify(pool.getConnection).bind(pool)();
  },

  query: async (sql, values) => {
    try {
      const result = await queryAsync(sql, values);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
};
