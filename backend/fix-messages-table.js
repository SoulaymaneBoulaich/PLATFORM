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
        console.log('Cleaning up old messages table columns...');

        // Check if receiver_id exists and drop it
        const [receiverIdColumns] = await connection.query(
            "SHOW COLUMNS FROM messages LIKE 'receiver_id'"
        );

        if (receiverIdColumns.length > 0) {
            console.log('Dropping receiver_id foreign key and column...');

            // Drop foreign key constraints first
            try {
                await connection.query('ALTER TABLE messages DROP FOREIGN KEY messages_ibfk_3');
                console.log('✓ Dropped messages_ibfk_3 foreign key');
            } catch (e) {
                console.log('Foreign key messages_ibfk_3 not found (OK)');
            }

            // Drop the column
            await connection.query('ALTER TABLE messages DROP COLUMN receiver_id');
            console.log('✓ Dropped receiver_id column');
        } else {
            console.log('✓ receiver_id column already removed');
        }

        // Check if property_id exists and drop it
        const [propertyIdColumns] = await connection.query(
            "SHOW COLUMNS FROM messages LIKE 'property_id'"
        );

        if (propertyIdColumns.length > 0) {
            console.log('Dropping property_id foreign key and column...');

            // Drop foreign key constraints first
            try {
                await connection.query('ALTER TABLE messages DROP FOREIGN KEY messages_ibfk_1');
                console.log('✓ Dropped messages_ibfk_1 foreign key');
            } catch (e) {
                console.log('Foreign key messages_ibfk_1 not found (OK)');
            }

            // Drop the column
            await connection.query('ALTER TABLE messages DROP COLUMN property_id');
            console.log('✓ Dropped property_id column');
        } else {
            console.log('✓ property_id column already removed');
        }

        console.log('\nMessages table cleanup completed successfully!');
        console.log('Messages table now uses: conversation_id, sender_id, content');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration().catch(console.error);
