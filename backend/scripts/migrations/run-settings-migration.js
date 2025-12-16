const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runMigration() {
    console.log('Starting settings table migration...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const sqlPath = path.join(__dirname, 'create_settings.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split and execute statements separately (migration file has multiple statements)
        const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

        for (const statement of statements) {
            await pool.query(statement);
            console.log('Executed statement successfully');
        }

        console.log('✅ Settings table created successfully.');
    } catch (e) {
        if (e.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('ℹ️  Settings table already exists.');
        } else {
            console.error('❌ Migration failed:', e.message);
            process.exit(1);
        }
    } finally {
        await pool.end();
    }
}

runMigration();
