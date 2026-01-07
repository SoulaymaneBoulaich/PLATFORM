const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
    console.log('Connecting to', process.env.DB_HOST);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        console.log('Connected successfully!');

        const [rows] = await connection.execute('SELECT * FROM users LIMIT 5');
        console.log('Recent Users found in DB:', rows);

        await connection.end();
    } catch (err) {
        console.error('Error connecting or querying:', err);
    }
}

checkDb();
