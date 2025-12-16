require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runIndexMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    });

    try {
        console.log('🔄 Applying performance indexes...\n');

        const sqlFile = path.join(__dirname, 'migrations', 'add_performance_indexes.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Execute the SQL
        await connection.query(sql);

        console.log('✅ Performance indexes applied successfully!');

        await connection.end();
        process.exit(0);
    } catch (err) {
        // If error is duplicate key name, it means indexes already exist
        if (err.code === 'ER_DUP_KEYNAME') {
            console.log('⚠️ Indexes already exist (Duplicate key name). Skipping.');
            await connection.end();
            process.exit(0);
        } else {
            console.error('\n❌ Migration failed:', err.message);
            await connection.end();
            process.exit(1);
        }
    }
}

runIndexMigration();
