// Run migration to add image_url column to properties
const pool = require('./config/database');

async function runMigration() {
    try {
        console.log('Adding image_url column to properties table...\n');

        await pool.query(`
            ALTER TABLE properties 
            ADD COLUMN image_url VARCHAR(500) NULL AFTER area_sqft
        `);

        console.log('✓ Column added successfully\n');

        // Copy existing primary images from property_images
        console.log('Copying primary images from property_images table...\n');

        const [result] = await pool.query(`
            UPDATE properties p
            LEFT JOIN property_images pi ON p.property_id = pi.property_id AND pi.is_primary = 1
            SET p.image_url = pi.image_url
            WHERE pi.image_url IS NOT NULL
        `);

        console.log(`✓ Updated ${result.affectedRows} properties with existing images\n`);

        // Verify
        const [properties] = await pool.query(`
            SELECT property_id, title, city, image_url 
            FROM properties 
            LIMIT 10
        `);

        console.log('Sample properties with image_url:');
        properties.forEach(prop => {
            console.log(`  ${prop.property_id}: ${prop.title} - ${prop.image_url || 'NO IMAGE'}`);
        });

        console.log('\n✅ Migration complete!');

    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️  Column already exists, skipping...');
        } else {
            console.error('❌ Error:', error.message);
        }
    } finally {
        process.exit();
    }
}

runMigration();
