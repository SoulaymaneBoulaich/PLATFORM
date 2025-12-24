const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function fixDatabaseSchema() {
    console.log('Starting database schema fix...');

    console.log('DB Config:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
        hasPassword: !!process.env.DB_PASSWORD
    });

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('Connected to database.');

        // Helper to check if column exists
        async function columnExists(tableName, columnName) {
            const [rows] = await connection.query(
                `SELECT COUNT(*) as count FROM information_schema.columns 
                 WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
                [process.env.DB_NAME, tableName, columnName]
            );
            return rows[0].count > 0;
        }

        // 1. Fix 'messages' table columns
        const mediaUrlExists = await columnExists('messages', 'media_url');
        if (!mediaUrlExists) {
            console.log('Adding media_url column to messages...');
            await connection.query('ALTER TABLE messages ADD COLUMN media_url VARCHAR(2048) NULL');
        }

        const mediaTypeExists = await columnExists('messages', 'media_type');
        if (!mediaTypeExists) {
            console.log('Adding media_type column to messages...');
            await connection.query("ALTER TABLE messages ADD COLUMN media_type ENUM('TEXT', 'AUDIO', 'IMAGE', 'VIDEO') DEFAULT 'TEXT'");
        }

        const statusExists = await columnExists('messages', 'status');
        if (!statusExists) {
            console.log('Adding status column to messages...');
            await connection.query("ALTER TABLE messages ADD COLUMN status ENUM('sent', 'delivered', 'read') DEFAULT 'sent'");
        }

        const deliveredAtExists = await columnExists('messages', 'delivered_at');
        if (!deliveredAtExists) {
            console.log('Adding delivered_at column to messages...');
            await connection.query('ALTER TABLE messages ADD COLUMN delivered_at DATETIME NULL');
        }

        const readAtExists = await columnExists('messages', 'read_at');
        if (!readAtExists) {
            console.log('Adding read_at column to messages...');
            await connection.query('ALTER TABLE messages ADD COLUMN read_at DATETIME NULL');
        }

        // 2. Fix 'properties' table
        const propImageUrlExists = await columnExists('properties', 'image_url');
        if (!propImageUrlExists) {
            console.log('Adding image_url column to properties...');
            await connection.query('ALTER TABLE properties ADD COLUMN image_url VARCHAR(2048) NULL');
        }

        // 3. Fix 'property_images' table if exists
        const propertyImagesExists = await connection.query("SHOW TABLES LIKE 'property_images'");
        if (propertyImagesExists[0].length === 0) {
            console.log('Creating property_images table...');
            await connection.query(`
                CREATE TABLE property_images (
                    image_id INT AUTO_INCREMENT PRIMARY KEY,
                    property_id INT NOT NULL,
                    image_url VARCHAR(2048) NOT NULL,
                    is_primary TINYINT(1) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
                )
             `);
        } else {
            const isPrimaryExists = await columnExists('property_images', 'is_primary');
            if (!isPrimaryExists) {
                console.log('Adding is_primary to property_images...');
                await connection.query('ALTER TABLE property_images ADD COLUMN is_primary TINYINT(1) DEFAULT 0');
            }
        }

        console.log('Database schema fix completed successfully.');

    } catch (error) {
        console.error('Error fixing database schema:', error);
    } finally {
        await connection.end();
    }
}

fixDatabaseSchema();
