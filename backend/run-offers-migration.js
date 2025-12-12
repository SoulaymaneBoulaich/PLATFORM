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
        console.log('Creating offers table...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS offers (
                offer_id INT PRIMARY KEY AUTO_INCREMENT,
                property_id INT NOT NULL,
                buyer_id INT NOT NULL,
                seller_id INT NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                status ENUM('Pending', 'Accepted', 'Rejected', 'Countered') DEFAULT 'Pending',
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
                FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_property_id (property_id),
                INDEX idx_buyer_id (buyer_id),
                INDEX idx_seller_id (seller_id),
                INDEX idx_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✓ Offers table created');

        // Check if property_status column exists
        const [columns] = await connection.query(
            "SHOW COLUMNS FROM properties LIKE 'property_status'"
        );

        if (columns.length === 0) {
            await connection.query(`
                ALTER TABLE properties 
                ADD COLUMN property_status ENUM('Available', 'Under Offer', 'Sold') DEFAULT 'Available'
            `);
            console.log('✓ Added property_status column');
        } else {
            console.log('✓ property_status column already exists');
        }

        console.log('\nOffers migration completed!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigration().catch(console.error);
