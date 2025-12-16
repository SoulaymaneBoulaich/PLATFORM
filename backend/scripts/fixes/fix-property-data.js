// Fix properties with missing property_type or status
const pool = require('../../config/database');

async function fixPropertyData() {
    try {
        console.log('Fixing property data quality issues...\n');

        // First, let's see what needs fixing
        const [problemProps] = await pool.query(`
            SELECT property_id, title, property_type, status, listing_type
            FROM properties
            WHERE property_type = '' OR property_type IS NULL OR status IS NULL
        `);

        console.log(`Found ${problemProps.length} properties with data issues:\n`);
        problemProps.forEach(prop => {
            console.log(`  ID ${prop.property_id}: ${prop.title}`);
            console.log(`    property_type: "${prop.property_type}" | status: "${prop.status}" | listing_type: "${prop.listing_type}"`);
        });

        // Update properties with empty/null property_type to 'house' (most common)
        const [typeResult] = await pool.query(`
            UPDATE properties
            SET property_type = 'house'
            WHERE property_type = '' OR property_type IS NULL
        `);
        console.log(`\n✓ Updated ${typeResult.affectedRows} properties with missing property_type`);

        // Update properties with null status based on listing_type
        const [statusResult] = await pool.query(`
            UPDATE properties
            SET status = CASE
                WHEN listing_type = 'sale' THEN 'active'
                WHEN listing_type = 'rent' THEN 'active'
                ELSE 'active'
            END
            WHERE status IS NULL
        `);
        console.log(`✓ Updated ${statusResult.affectedRows} properties with missing status`);

        // Verify the fix
        const [verifyResult] = await pool.query(`
            SELECT COUNT(*) as count
            FROM properties
            WHERE property_type = '' OR property_type IS NULL OR status IS NULL
        `);

        console.log(`\n✓ Properties with missing data after fix: ${verifyResult[0].count}`);

        // Show updated counts
        const [typeStats] = await pool.query(`
            SELECT property_type, COUNT(*) as count
            FROM properties
            GROUP BY property_type
            ORDER BY count DESC
        `);

        console.log('\nProperty Type Distribution:');
        typeStats.forEach(stat => {
            console.log(`  ${stat.property_type || '(empty)'}: ${stat.count}`);
        });

        const [statusStats] = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM properties
            GROUP BY status
            ORDER BY count DESC
        `);

        console.log('\nStatus Distribution:');
        statusStats.forEach(stat => {
            console.log(`  ${stat.status || '(null)'}: ${stat.count}`);
        });

        console.log('\n✅ Data fix complete!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit();
    }
}

fixPropertyData();
