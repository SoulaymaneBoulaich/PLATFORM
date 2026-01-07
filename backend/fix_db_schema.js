const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function fixSchema() {
    try {
        console.log('Dropping transactions table...');
        await pool.query('DROP TABLE IF EXISTS transactions');

        console.log('Re-creating transactions table...');
        const transactionSql = fs.readFileSync(path.join(__dirname, 'migrations', 'create_transactions_table.sql'), 'utf8');
        // Split by semicolon in case there are multiple statements, but usually exec works for one.
        // Mysql2 pool.query can handle multiple statements if configured, but let's be safe and just run the CREATE.
        const statements = transactionSql.split(';').filter(s => s.trim());
        for (const stmt of statements) {
            await pool.query(stmt);
        }

        console.log('Checking notifications table...');
        const [notifExists] = await pool.query("SHOW TABLES LIKE 'notifications'");
        if (notifExists.length === 0) {
            console.log('Creating notifications table...');
            const notifSql = fs.readFileSync(path.join(__dirname, 'migrations', 'create_notifications.sql'), 'utf8');
            const notifStmts = notifSql.split(';').filter(s => s.trim());
            for (const stmt of notifStmts) {
                await pool.query(stmt);
            }
        }

        console.log('Schema fixed.');

    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        process.exit();
    }
}

fixSchema();
