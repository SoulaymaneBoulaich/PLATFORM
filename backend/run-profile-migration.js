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
        console.log('Adding profile columns to users table...');

        await connection.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500) NULL,
            ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL,
            ADD COLUMN IF NOT EXISTS bio TEXT NULL,
            ADD COLUMN IF NOT EXISTS location VARCHAR(150) NULL
        `);

        console.log('✓ Profile columns added');

        console.log('Creating user_settings table...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT UNIQUE NOT NULL,
                email_notifications TINYINT(1) DEFAULT 1,
                sms_notifications TINYINT(1) DEFAULT 0,
                dark_mode TINYINT(1) DEFAULT 0,
                language VARCHAR(10) DEFAULT 'en',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✓ user_settings table created');
        console.log('\nProfile migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration().catch(console.error);
