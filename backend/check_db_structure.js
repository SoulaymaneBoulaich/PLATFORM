const mysql = require('mysql2/promise');
require('dotenv').config();

async function inspectDatabase() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log('Connected!');

        // List all databases
        const [databases] = await connection.query('SHOW DATABASES');
        console.log('\n--- DATABASES ---');
        databases.forEach(db => console.log(db.Database));

        // List all tables in current database
        console.log(`\n--- TABLES IN ${process.env.DB_NAME} ---`);
        const [tables] = await connection.query('SHOW TABLES');
        tables.forEach(row => {
            // The key name varies based on DB name, usually `Tables_in_dbname`
            const tableName = Object.values(row)[0];
            console.log(tableName);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) await connection.end();
    }
}

inspectDatabase();
