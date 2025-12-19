const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function seed() {
    console.log('🌱 Starting presentation seed...');

    const seedsPath = path.join(__dirname, '../../migrations/seed_presentation_data.sql');
    if (!fs.existsSync(seedsPath)) {
        console.error('❌ Seed file not found:', seedsPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(seedsPath, 'utf8');

    // Split statements (simple split by semicolon at end of line)
    // Note: detailed SQL parsing might be needed if statements contain semicolons within strings
    // But for our seed file, usually splitting by `;\r\n` or `;\n` is enough if formatted well.
    // However, mysql2 supports multipleStatements if configured.

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('🔌 Connected to database.');

        await connection.query(sql);

        console.log('✅ Presentation data seeded successfully.');
        await connection.end();
    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
}

seed();
