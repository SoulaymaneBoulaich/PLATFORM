const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runMigration() {
    console.log('Starting favorites table migration...');
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const sqlPath = path.join(__dirname, 'migrations', 'create_favorites.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);
        console.log('✅ Favorites table created successfully.');
    } catch (e) {
        if (e.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('ℹ️  Favorites table already exists, skipping...');
        } else {
            console.error('❌ Migration failed:', e.message);
            process.exit(1);
        }
    } finally {
        await pool.end();
    }
}

runMigration();
