const mysql = require('mysql2/promise');
require('dotenv').config();

async function addLocationColumn() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('Checking users table schema...');
        const [columns] = await connection.query('SHOW COLUMNS FROM users');
        const hasLocation = columns.some(col => col.Field === 'location');

        if (!hasLocation) {
            console.log('Adding location column to users table...');
            await connection.query('ALTER TABLE users ADD COLUMN location VARCHAR(255) AFTER phone');
            console.log('✅ Location column added successfully.');
        } else {
            console.log('ℹ️ Location column already exists.');
        }

    } catch (error) {
        console.error('❌ Error updating database:', error);
    } finally {
        await connection.end();
    }
}

addLocationColumn();
