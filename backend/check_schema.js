const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    const [rows] = await connection.query("SHOW COLUMNS FROM users");
    console.log("Columns in 'users' table:");
    rows.forEach(row => console.log(row.Field));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

checkSchema();
