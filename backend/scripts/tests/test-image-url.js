// Test script to verify image_url column
const pool = require('../../config/database');
(async () => {
    try {
        const [rows] = await pool.query('SELECT property_id, title, image_url FROM properties LIMIT 5');
        console.log('Sample properties:');
        rows.forEach(r => console.log(`${r.property_id}: ${r.title} - ${r.image_url || 'NO IMAGE'}`));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit();
    }
})();
