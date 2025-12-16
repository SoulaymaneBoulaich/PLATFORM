const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Running multi-role conversations migration...');

        const migrationPath = path.join(__dirname, 'migrations', 'update_conversations_multi_role.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Split and execute each statement
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.substring(0, 100)}...`);
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
