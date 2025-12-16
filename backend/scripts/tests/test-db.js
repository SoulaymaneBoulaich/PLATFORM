// Check properties table schema and current image handling
const pool = require('../../config/database');

async function checkSchema() {
    try {
        console.log('Checking properties table structure...\n');

        const [columns] = await pool.query('DESCRIBE properties');
        console.log('Current columns:');
        columns.forEach(col => {
            console.log(`  ${col.Field} - ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        // Check if image_url column exists
        const hasImageUrl = columns.some(col => col.Field === 'image_url');
        console.log(`\nimage_url column exists: ${hasImageUrl}`);

        // Check property_images table
        console.log('\n\nChecking property_images table...');
        const [imageColumns] = await pool.query('DESCRIBE property_images');
        console.log('Property images columns:');
        imageColumns.forEach(col => {
            console.log(`  ${col.Field} - ${col.Type}`);
        });

        const [imageCount] = await pool.query('SELECT COUNT(*) as count FROM property_images');
        console.log(`\nTotal property images: ${imageCount[0].count}`);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit();
    }
}

checkSchema();
