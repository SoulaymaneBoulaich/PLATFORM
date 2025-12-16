const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runMigration() {
    console.log('Starting media migration...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const sqlPath = path.join(__dirname, 'migrations', 'add_media_to_messages.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        const statements = sql.split(';').filter(s => s.trim());

        for (const stmt of statements) {
            try {
                await pool.query(stmt);
                console.log('Executed statement successfully');
            } catch (err) {
                // Ignore "Duplicate column name" errors if we ran it partially before
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('Column already exists, skipping...');
                } else {
                    console.error('Error executing statement:', err.message);
                    throw err;
                }
            }
        }
        console.log('Migration completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
