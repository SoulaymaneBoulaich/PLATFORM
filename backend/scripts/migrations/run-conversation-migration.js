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
        console.log('Creating conversations table...');

        const migration = `
            CREATE TABLE IF NOT EXISTS conversations (
                conversation_id INT PRIMARY KEY AUTO_INCREMENT,
                property_id INT,
                buyer_id INT NOT NULL,
                seller_id INT NOT NULL,
                last_message TEXT,
                last_message_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
                FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
                UNIQUE KEY unique_conversation (property_id, buyer_id, seller_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await connection.query(migration);
        console.log('✓ Conversations table created successfully');

        // Check if conversation_id column exists in messages
        const [columns] = await connection.query(
            "SHOW COLUMNS FROM messages LIKE 'conversation_id'"
        );

        if (columns.length === 0) {
            console.log('Adding conversation_id to messages table...');
            await connection.query(`
                ALTER TABLE messages 
                ADD COLUMN conversation_id INT AFTER message_id,
                ADD FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE
            `);
            console.log('✓ Messages table updated successfully');
        } else {
            console.log('✓ Messages table already has conversation_id column');
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration().catch(console.error);
