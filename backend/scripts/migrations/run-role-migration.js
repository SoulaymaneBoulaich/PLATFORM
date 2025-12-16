// Migration runner for role-based system
require('dotenv').config({ path: __dirname + '/.env' });
const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('🚀 Starting role-based system migration...\n');

        // Read migration SQL file
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'role_based_system.sql'),
            'utf8'
        );

        // Split by statements (basic approach - may need refinement for complex SQL)
        const statements = migrationSQL
            .split(/;\s*$/gm)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));

        let successCount = 0;
        let skipCount = 0;

        for (const statement of statements) {
            try {
                await pool.query(statement);
                successCount++;
                const preview = statement.substring(0, 50).replace(/\s+/g, ' ');
                console.log(`✓ ${preview}...`);
            } catch (err) {
                // Skip errors for operations that might already be done
                if (err.code === 'ER_DUP_FIELDNAME' ||
                    err.code === 'ER_TABLE_EXISTS_ERROR' ||
                    err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                    skipCount++;
                    console.log(`⚠️  Skipped (already exists): ${statement.substring(0, 40)}...`);
                } else {
                    console.error(`❌ Error executing:`, statement.substring(0, 100));
                    console.error(`   ${err.message}`);
                }
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`   Successful: ${successCount}`);
        console.log(`   Skipped: ${skipCount}`);
        console.log(`\n✅ Migration completed!`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runMigration();
