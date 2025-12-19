const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixSellers() {
    console.log('🔧 Fixing missing seller records...');

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        const sql = `
            INSERT INTO agents (user_id, license_number, agency_name, bio)
            SELECT 
                user_id, 
                CONCAT('LIC-', user_id) as license_number,
                'Independent Seller' as agency_name,
                'Property Seller' as bio
            FROM users 
            WHERE user_type = 'seller' 
            AND user_id NOT IN (SELECT user_id FROM agents)
        `;

        const [result] = await connection.query(sql);

        console.log(`✅ Fixed! Inserted ${result.affectedRows} missing agent records.`);
        console.log('🎉 Your sellers should now appear on the website.');

    } catch (err) {
        console.error('❌ Error fixing sellers:', err);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

fixSellers();
