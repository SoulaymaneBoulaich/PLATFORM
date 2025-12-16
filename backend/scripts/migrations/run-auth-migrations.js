const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runAuthMigrations() {
    // Create connection with multipleStatements enabled
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    });

    try {
        console.log('🔄 Running authentication migrations...\n');

        // Migration 1: Enhance users table
        console.log('1️⃣  Enhancing users table...');
        const enhanceUsersSql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'enhance_users_for_auth.sql'),
            'utf8'
        );

        await connection.query(enhanceUsersSql);
        console.log('✅ Users table enhanced\n');

        // Migration 2: Create password reset tokens table
        console.log('2️⃣  Creating password_reset_tokens table...');
        const tokensSql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'create_password_reset_tokens.sql'),
            'utf8'
        );
        await connection.query(tokensSql);
        console.log('✅ password_reset_tokens table created\n');

        console.log('🎉 All authentication migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

runAuthMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
