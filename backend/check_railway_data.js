const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRailwayData() {
    console.log('------------------------------------------------');
    console.log('CONNECTING TO RAILWAY DATABASE');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log('------------------------------------------------');

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            connectTimeout: 20000 // 20 seconds timeout
        });
        console.log('✅ CONNECTION SUCCESSFUL!');

        console.log('\nQUERYING RECENT USERS...');
        // Correcting column name from 'created_at' to 'date_registered' based on init.sql schema
        const [rows] = await connection.execute(
            'SELECT user_id, first_name, last_name, email, date_registered FROM users ORDER BY date_registered DESC LIMIT 5'
        );

        if (rows.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log('Recent Users Found:');
            console.table(rows);
        }

    } catch (err) {
        console.error('❌ CONNECTION/QUERY FAILED');
        console.error('Error Code:', err.code);
        console.error('Message:', err.message);
        if (err.code === 'ETIMEDOUT') {
            console.log('\nTip: The connection timed out. This suggests a network issue reaching Railway from this specific machine/IP.');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nConnection closed.');
        }
    }
}

checkRailwayData();
