const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Adding conversation_participants table...');

        const migrationPath = path.join(__dirname, 'migrations', 'add_conversation_participants.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Split and execute each statement
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.substring(0, 80)}...`);
                await pool.query(statement);
            }
        }

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
