// Seed properties with sample Unsplash images
const pool = require('../../config/database');

async function seedImages() {
    try {
        console.log('Seeding properties with sample image URLs...\n');

        const [result] = await pool.query(`
            UPDATE properties 
            SET image_url = CASE property_id
                WHEN 2 THEN 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
                WHEN 6 THEN 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
                WHEN 7 THEN 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
                WHEN 8 THEN 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
                WHEN 9 THEN 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'
                WHEN 10 THEN 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
                WHEN 11 THEN 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
                WHEN 12 THEN 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'
                ELSE image_url
            END
            WHERE property_id IN (2, 6, 7, 8, 9, 10, 11, 12)
        `);

        console.log(`✓ Updated ${result.affectedRows} properties with image URLs\n`);

        // Show results
        const [properties] = await pool.query(`
            SELECT property_id, title, city, image_url
            FROM properties
            WHERE image_url IS NOT NULL
            ORDER BY property_id
        `);

        console.log('Properties with images:');
        properties.forEach(prop => {
            console.log(`  ${prop.property_id}: ${prop.title} - ${prop.image_url}`);
        });

        console.log('\n✅ Seeding complete!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        process.exit();
    }
}

seedImages();
