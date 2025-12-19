const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        enableKeepAlive: true,
        connectTimeout: 60000
    });

    try {
        const [rows] = await connection.query('DESCRIBE agents');
        console.log('AGENTS Table Schema:');
        console.table(rows);
    } catch (error) {
        console.error('Error describing agents table:', error);
    } finally {
        await connection.end();
    }
}

checkSchema();
