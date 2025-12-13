const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
};

async function runMigration(fileName) {
    const filePath = path.join(__dirname, '../migrations', fileName);
    console.log(`Reading migration file: ${filePath}`);

    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        const connection = await mysql.createConnection(config);
        console.log(`Connected to database at ${config.host}`);

        console.log(`Executing ${fileName}...`);
        await connection.query(sql);
        console.log(`Successfully executed ${fileName}`);

        await connection.end();
    } catch (err) {
        console.error(`Error running ${fileName}:`, err);
        process.exit(1);
    }
}

async function main() {
    await runMigration('create_notifications.sql');
    await runMigration('seed_dashboard_data.sql');
    console.log('All migrations completed.');
}

main();
