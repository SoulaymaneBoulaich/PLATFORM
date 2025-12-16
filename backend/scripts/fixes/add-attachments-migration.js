const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'real_estate',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('Adding attachment columns to messages table...');

        // Check if attachment_url exists
        const [urlColumns] = await connection.query(
            "SHOW COLUMNS FROM messages LIKE 'attachment_url'"
        );

        if (urlColumns.length === 0) {
            await connection.query(`
                ALTER TABLE messages 
                ADD COLUMN attachment_url VARCHAR(500) NULL AFTER content,
                ADD COLUMN attachment_type VARCHAR(50) NULL AFTER attachment_url
            `);
            console.log('✓ Added attachment_url and attachment_type columns');
        } else {
            console.log('✓ Attachment columns already exist');
        }

        console.log('\nMessages table updated successfully!');
        console.log('Messages now support: text, images, files, audio, and video');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration().catch(console.error);
