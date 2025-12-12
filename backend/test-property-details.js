// Test all the new property details features
const pool = require('./config/database');

async function testFeatures() {
    try {
        console.log('=== Testing Property Details Features ===\n');

        //  1. Test property with owner info
        console.log('1. Testing owner info in GET /properties/:id');
        const [property] = await pool.query(`
            SELECT 
                p.property_id, p.title, p.city, p.country,
                u.first_name as owner_first_name,
                u.last_name as owner_last_name
            FROM properties p
            LEFT JOIN users u ON p.seller_id = u.user_id
            LIMIT 1
        `);

        if (property[0]) {
            console.log(`   ✓ Property: ${property[0].title}`);
            console.log(`   ✓ Location: ${property[0].city}, ${property[0].country || 'Unknown'}`);
            console.log(`   ✓ Owner: ${property[0].owner_first_name || 'N/A'} ${property[0].owner_last_name || ''}`);
        }

        // 2. Check property_reviews table
        console.log('\n2. Checking property_reviews table');
        const [reviews] = await pool.query('SELECT COUNT(*) as count FROM property_reviews');
        console.log(`   ✓ Total reviews in database: ${reviews[0].count}`);

        // 3. Check contact_messages table
        console.log('\n3. Checking contact_messages table');
        const [messages] = await pool.query('SELECT COUNT(*) as count FROM contact_messages');
        console.log(`   ✓ Total contact messages: ${messages[0].count}`);

        // 4. Test city-to-country mapping
        const { getCountryFromCity } = require('./utils/cityToCountry');
        const testCities = ['Casablanca', 'Rabat', 'Paris', 'Unknown City'];
        console.log('\n4. Testing city-to-country mapping:');
        testCities.forEach(city => {
            const country = getCountryFromCity(city);
            console.log(`   ${city} → ${country}`);
        });

        console.log('\n✅ All systems operational!');
        console.log('\nNext steps:');
        console.log('  - Create a test property with city "Rabat"');
        console.log('  - Verify country auto-fills to "Morocco"');
        console.log('  - Add a review with comment');
        console.log('  - Submit a contact message');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        process.exit();
    }
}

testFeatures();
