const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('Starting database reset...');

        // Disable foreign key checks to allow deletion in any order (safest for full wipe)
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const tables = [
            'messages',
            'conversations',
            'notifications',
            'transactions',
            'reviews',
            'offers',
            'favorites',
            'property_images',
            'properties',
            'agents',
            'password_reset_tokens',
            'users'
        ];

        for (const table of tables) {
            try {
                await connection.query(`TRUNCATE TABLE ${table}`);
                console.log(`✅ Cleared table: ${table}`);
            } catch (err) {
                // Fallback to DELETE if TRUNCATE fails (sometimes due to partial constraints even with checks off)
                await connection.query(`DELETE FROM ${table}`);
                console.log(`✅ Cleared table (via DELETE): ${table}`);
            }
        }

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🎉 Database reset complete!');

    } catch (error) {
        console.error('❌ Error resetting database:', error);
    } finally {
        await connection.end();
    }
}

resetDatabase();
