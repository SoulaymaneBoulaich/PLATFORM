// Run database migrations for notifications and messages
const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    try {
        console.log('Running notifications and chat migrations...\n');

        // Read and execute notifications migration
        const notificationsSql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'create_notifications.sql'),
            'utf8'
        );
        await pool.query(notificationsSql);
        console.log('✓ Created notifications table');

        // Read and execute messages migration
        const messagesSql = fs.readFileSync(
            path.join(__dirname, 'migrations', 'create_messages.sql'),
            'utf8'
        );
        await pool.query(messagesSql);
        console.log('✓ Created messages table');

        // Verify tables exist
        const [tables1] = await pool.query("SHOW TABLES LIKE 'notifications'");
        const [tables2] = await pool.query("SHOW TABLES LIKE 'messages'");

        console.log(`\n✅ Migration complete!`);
        console.log(`   - notifications: ${tables1.length > 0 ? 'EXISTS' : 'NOT FOUND'}`);
        console.log(`   - messages: ${tables2.length > 0 ? 'EXISTS' : 'NOT FOUND'}`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        process.exit();
    }
}

runMigrations();
