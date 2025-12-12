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
        console.log('Creating analytics tables...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS property_views (
                id INT PRIMARY KEY AUTO_INCREMENT,
                property_id INT NOT NULL,
                user_id INT NULL,
                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
                INDEX idx_property_id (property_id),
                INDEX idx_user_id (user_id),
                INDEX idx_viewed_at (viewed_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✓ property_views table created');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS property_favorites (
                id INT PRIMARY KEY AUTO_INCREMENT,
                property_id INT NOT NULL,
                user_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                UNIQUE KEY unique_favorite (property_id, user_id),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✓ property_favorites table created');
        console.log('\nAnalytics tables migration completed!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration().catch(console.error);
