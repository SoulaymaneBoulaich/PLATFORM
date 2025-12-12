// Test the complete image URL flow
const pool = require('./config/database');

async function testImageFlow() {
    try {
        console.log('=== Testing Image URL Flow ===\n');

        // 1. Check what properties currently have
        console.log('1. Checking existing properties with image_url:');
        const [properties] = await pool.query(`
            SELECT property_id, title, image_url, 
                   CASE WHEN image_url IS NULL THEN 'NULL'
                        WHEN image_url = '' THEN 'EMPTY'
                        ELSE 'HAS VALUE'
                   END as url_status
            FROM properties
            ORDER BY property_id DESC
            LIMIT 5
        `);

        properties.forEach(p => {
            console.log(`  ID ${p.property_id}: ${p.title}`);
            console.log(`    image_url: "${p.image_url}" [${p.url_status}]`);
        });

        // 2. Simulate what the API GET /properties returns
        console.log('\n2. Simulating GET /api/properties response:');
        const [apiResponse] = await pool.query(`
            SELECT property_id, seller_id, title, description, property_type, listing_type, 
                   price, city, bedrooms, bathrooms, area_sqft, status, image_url 
            FROM properties 
            WHERE status = 'active'
            LIMIT 3
        `);

        console.log('API would return:');
        apiResponse.forEach(p => {
            console.log(`  {`);
            console.log(`    property_id: ${p.property_id},`);
            console.log(`    title: "${p.title}",`);
            console.log(`    image_url: ${p.image_url ? `"${p.image_url}"` : 'null'},`);
            console.log(`  }`);
        });

        // 3. Check if address field name mismatch
        console.log('\n3. Checking field name mappings:');
        const [sampleProp] = await pool.query(`
            SELECT property_id, address_line1, city, area_sqft
            FROM properties
            LIMIT 1
        `);
        if (sampleProp.length > 0) {
            console.log(`  Database has: address_line1 = "${sampleProp[0].address_line1}"`);
            console.log(`  Frontend expects: address (needs mapping)`);
            console.log(`  Database has: area_sqft = ${sampleProp[0].area_sqft}`);
            console.log(`  Frontend expects: area (needs mapping)`);
        }

        console.log('\n✅ Test complete!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit();
    }
}

testImageFlow();
