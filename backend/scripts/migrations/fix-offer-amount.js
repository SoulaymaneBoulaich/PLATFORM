const pool = require('../../config/database');

async function migrate() {
    try {
        console.log('Connecting to database...');
        // Test connection
        await pool.query('SELECT 1');
        console.log('Connected. Altering offers table...');

        await pool.query("ALTER TABLE offers MODIFY amount DECIMAL(18,2) NOT NULL");

        console.log('Success! offers table updated to DECIMAL(18,2).');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
