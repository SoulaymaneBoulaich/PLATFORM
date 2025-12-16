require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true  // Enable multiple statements
    });

    try {
        console.log('🔄 Running messaging migration...\n');

        // Execute statements
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('✓ Disabled FK checks');

        await connection.query('DROP TABLE IF EXISTS messages');
        console.log('✓ Dropped messages table');

        await connection.query('DROP TABLE IF EXISTS conversation_participants');
        console.log('✓ Dropped conversation_participants table');

        await connection.query('DROP TABLE IF EXISTS conversations');
        console.log('✓ Dropped conversations table');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✓ Re-enabled FK checks\n');

        // Create conversations
        await connection.query(`
            CREATE TABLE conversations (
              conversation_id INT AUTO_INCREMENT PRIMARY KEY,
              property_id INT NULL,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_property_id (property_id),
              INDEX idx_updated_at (updated_at),
              FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created conversations table');

        // Create participants
        await connection.query(`
            CREATE TABLE conversation_participants (
              id INT AUTO_INCREMENT PRIMARY KEY,
              conversation_id INT NOT NULL,
              user_id INT NOT NULL,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              UNIQUE KEY uniq_conv_user (conversation_id, user_id),
              INDEX idx_conversation_id (conversation_id),
              INDEX idx_user_id (user_id),
              FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
              FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created conversation_participants table');

        // Create messages
        await connection.query(`
            CREATE TABLE messages (
              message_id INT AUTO_INCREMENT PRIMARY KEY,
              conversation_id INT NOT NULL,
              sender_id INT NOT NULL,
              content TEXT NOT NULL,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME NULL,
              is_edited TINYINT(1) NOT NULL DEFAULT 0,
              deleted_at DATETIME NULL,
              INDEX idx_conversation_id (conversation_id),
              INDEX idx_sender_id (sender_id),
              INDEX idx_created_at (created_at),
              INDEX idx_deleted_at (deleted_at),
              FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
              FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created messages table');

        // Create visits
        await connection.query(`
            CREATE TABLE IF NOT EXISTS visits (
              visit_id INT AUTO_INCREMENT PRIMARY KEY,
              buyer_id INT NOT NULL,
              property_id INT NOT NULL,
              scheduled_at DATETIME NOT NULL,
              status ENUM('PENDING','CONFIRMED','CANCELLED') DEFAULT 'PENDING',
              notes TEXT NULL,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_buyer_id (buyer_id),
              INDEX idx_property_id (property_id),
              INDEX idx_scheduled_at (scheduled_at),
              INDEX idx_status (status),
              FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
              FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✓ Created visits table\n');

        console.log('✅ Migration completed successfully!\n');

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        await connection.end();
        process.exit(1);
    }
}

runMigration();
