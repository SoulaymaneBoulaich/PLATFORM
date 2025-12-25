const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function seed() {
    console.log('🌱 Starting offers seed...');

    const seedsPath = path.join(__dirname, '../../migrations/seed_offers.sql');
    if (!fs.existsSync(seedsPath)) {
        console.error('❌ Seed file not found:', seedsPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(seedsPath, 'utf8');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('🔌 Connected to database for offers seed.');

        await connection.query(sql);

        console.log('✅ Offers seeded successfully.');
        await connection.end();
    } catch (err) {
        console.error('❌ Error seeding offers:', err);
        process.exit(1);
    }
}

seed();
