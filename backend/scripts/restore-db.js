const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function restoreDatabase() {
    console.log('🔄 Restoring database from presentation snapshot...');

    const snapshotPath = path.join(__dirname, '../migrations/presentation_snapshot.sql');

    if (!fs.existsSync(snapshotPath)) {
        console.error('❌ Snapshot file not found:', snapshotPath);
        process.exit(1);
    }

    try {
        // Read file content
        // Note: PowerShell redirection sometimes creates UTF-16LE files. 
        // We attempt to read as utf8, if it looks like garbage (null bytes), we might need to handle it.
        // But the simplest way is to let the mysql client utility handle it if installed, 
        // or just read it here and split by statements.
        // Actually, running 'mysql < file.sql' via docker exec is the most robust way.

        console.log('📦 Executing SQL file inside Docker container...');

        const { exec } = require('child_process');

        // We use docker exec to run the import command
        // We need to cat the file (from host?) No, we need to correct the file encoding first if it's UTF16.
        // Let's assume the user runs this on the host. 

        // BETTER APPROACH:
        // Use the same connection logic as seeds.

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('🔌 Connected to database.');

        let sql = fs.readFileSync(snapshotPath, 'utf8');

        // Basic check for UTF-16LE BOM or null bytes which imply wrong encoding
        if (sql.charCodeAt(0) === 0xFEFF || sql.includes('\u0000')) {
            console.log('⚠️ Detected UTF-16 encoding, converting...');
            sql = fs.readFileSync(snapshotPath, 'utf16le');
        }

        console.log('Start importing...');
        await connection.query(sql);

        console.log('✅ Database restored successfully! Data is now synchronized.');
        await connection.end();
        process.exit(0);

    } catch (err) {
        console.error('❌ Failed to restore database:', err);
        process.exit(1);
    }
}

restoreDatabase();
