const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function cleanup() {
    console.log('🧹 Removing presentation seed data...');

    const cleanupPath = path.join(__dirname, '../../migrations/cleanup_presentation_data.sql');
    if (!fs.existsSync(cleanupPath)) {
        console.error('❌ Cleanup file not found:', cleanupPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(cleanupPath, 'utf8');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('🔌 Connected to database.');

        await connection.query(sql);

        console.log('✅ Presentation data removed successfully.');
        console.log('📝 You can now add your data manually via Docker MySQL shell.');
        await connection.end();
    } catch (err) {
        console.error('❌ Error removing data:', err);
        process.exit(1);
    }
}

cleanup();
