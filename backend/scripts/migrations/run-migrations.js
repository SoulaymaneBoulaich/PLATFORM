// Run database migrations for property reviews and contact messages
const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    try {
        console.log('Running database migrations...\n');

        // Read and execute property_reviews migration
        const reviewsSql = fs.readFileSync(
            path.join(__dirname, '../../migrations', 'create_property_reviews.sql'),
            'utf8'
        );
        await pool.query(reviewsSql);
        console.log('✓ Created property_reviews table');

        // Read and execute contact_messages migration
        const contactSql = fs.readFileSync(
            path.join(__dirname, '../../migrations', 'create_contact_messages.sql'),
            'utf8'
        );
        await pool.query(contactSql);
        console.log('✓ Created contact_messages table');

        // Verify tables exist
        const [tables] = await pool.query("SHOW TABLES LIKE 'property_reviews'");
        const [tables2] = await pool.query("SHOW TABLES LIKE 'contact_messages'");

        console.log(`\n✅ Migration complete!`);
        console.log(`   - property_reviews: ${tables.length > 0 ? 'EXISTS' : 'NOT FOUND'}`);
        console.log(`   - contact_messages: ${tables2.length > 0 ? 'EXISTS' : 'NOT FOUND'}`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        process.exit();
    }
}

runMigrations();
