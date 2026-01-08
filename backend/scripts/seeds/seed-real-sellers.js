const pool = require('../../config/database');
const User = require('../../models/User');
const Property = require('../../models/Property');
const PropertyImage = require('../../models/PropertyImage');
const bcrypt = require('bcryptjs');

// Realistic high-quality real estate images from Unsplash
const PROPERTY_IMAGES = [
    'https://images.unsplash.com/photo-1600596542815-60002552253b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687644-c6f3218a9d09?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfe1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585153490-76fb20a32601?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566752538-2c262a5b28d4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585152589-733cf629705a?auto=format&fit=crop&w=1200&q=80'
];

// Profile images (men and women mix)
const PROFILE_IMAGES = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1514315384763-ba401779410f?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?auto=format&fit=crop&w=400&q=80'
];

const FIRST_NAMES = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
    'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
    'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'
];

const LAST_NAMES = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const CITIES = [
    { name: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' },
    { name: 'New York', state: 'NY', zip: '10001', country: 'USA' },
    { name: 'Miami', state: 'FL', zip: '33101', country: 'USA' },
    { name: 'San Francisco', state: 'CA', zip: '94101', country: 'USA' },
    { name: 'Chicago', state: 'IL', zip: '60601', country: 'USA' },
    { name: 'Austin', state: 'TX', zip: '78701', country: 'USA' },
    { name: 'Seattle', state: 'WA', zip: '98101', country: 'USA' },
    { name: 'Boston', state: 'MA', zip: '02101', country: 'USA' },
    { name: 'Denver', state: 'CO', zip: '80201', country: 'USA' },
    { name: 'Las Vegas', state: 'NV', zip: '89101', country: 'USA' }
];

const PROPERTY_TYPES = ['house', 'apartment', 'condo', 'land', 'commercial'];
const ADJECTIVES = ['Luxury', 'Modern', 'Cozy', 'Spacious', 'Charming', 'Elegant', 'Exclusive', 'Premium', 'Urban', 'Secluded'];

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generatePhoneNumber = () => {
    return `+1 (${getRandomInt(200, 999)}) ${getRandomInt(200, 999)}-${getRandomInt(1000, 9999)}`;
};

async function seedRealSellers() {
    try {
        console.log('Starting realistic seller seed...');

        // Hash password once to reuse
        const passwordHash = await bcrypt.hash('password123', 10);

        let sellersCreated = 0;
        let propertiesCreated = 0;

        // Check how many we have already
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE user_type = "seller"');
        const currentCount = rows[0].count;
        const targetCount = 30;

        console.log(`Current sellers: ${currentCount}. Target: ${targetCount}`);

        if (currentCount >= targetCount) {
            console.log('Sufficient sellers already exist.');
            process.exit(0);
        }

        const remaining = targetCount - currentCount;
        console.log(`Creating ${remaining} more sellers...`);

        // Use random offset for names to ensure variety if running multiple times
        const offset = currentCount;

        // Generate sellers
        for (let i = 0; i < remaining; i++) {
            try {
                const idx = i + offset;
                const firstName = FIRST_NAMES[idx % FIRST_NAMES.length];
                const lastName = LAST_NAMES[idx % LAST_NAMES.length];
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 9999)}@example.com`;

                // Create user
                const sellerId = await User.create({
                    email,
                    password_hash: passwordHash,
                    first_name: firstName,
                    last_name: lastName,
                    phone: generatePhoneNumber(),
                    user_type: 'seller',
                    preferences: { notification_email: true, currency: 'USD' }
                });

                const profileImage = PROFILE_IMAGES[idx % PROFILE_IMAGES.length];
                await pool.query('UPDATE users SET profile_image = ? WHERE user_id = ?', [profileImage, sellerId]);

                sellersCreated++;
                console.log(`Created Seller ${sellersCreated}/${remaining}: ${firstName} ${lastName} (${email})`);

                // Generate 2-3 properties per seller
                const numProperties = getRandomInt(2, 3);

                for (let j = 0; j < numProperties; j++) {
                    const cityData = getRandomElement(CITIES);
                    const propertyType = getRandomElement(PROPERTY_TYPES);
                    const adjective = getRandomElement(ADJECTIVES);

                    const title = `${adjective} ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${cityData.name}`;
                    const price = getRandomInt(250000, 2500000);
                    const bedrooms = getRandomInt(1, 6);
                    const bathrooms = getRandomInt(1, bedrooms + 1);
                    const area = getRandomInt(750, 5000);

                    // Select random images
                    const mainImage = getRandomElement(PROPERTY_IMAGES);
                    const image2 = getRandomElement(PROPERTY_IMAGES.filter(img => img !== mainImage));
                    const image3 = getRandomElement(PROPERTY_IMAGES.filter(img => img !== mainImage && img !== image2));

                    const propertyId = await Property.create({
                        seller_id: sellerId,
                        title: title,
                        description: `Experience the best of ${cityData.name} living in this ${title.toLowerCase()}. This property features ${bedrooms} bedrooms, ${bathrooms} bathrooms, and boasts ${area} sqft of living space. Perfect for those seeking ${adjective.toLowerCase()} lifestyle.`,
                        property_type: propertyType,
                        listing_type: 'sale',
                        price: price,
                        address_line1: `${getRandomInt(100, 9999)} ${getRandomElement(['Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Washington'])} St`,
                        city: cityData.name,
                        state: cityData.state,
                        zip_code: cityData.zip,
                        country: cityData.country,
                        bedrooms: bedrooms,
                        bathrooms: bathrooms,
                        area_sqft: area,
                        has_garage: Math.random() > 0.5,
                        has_pool: Math.random() > 0.3,
                        has_garden: Math.random() > 0.4,
                        image_url: mainImage
                    });

                    // Add secondary images in Try-Catch to avoid crash if image insert fails but prop is valid
                    try {
                        await PropertyImage.create(propertyId, mainImage, true); // Primary
                        await PropertyImage.create(propertyId, image2, false);
                        await PropertyImage.create(propertyId, image3, false);
                    } catch (imgErr) {
                        console.error('Error creating property images:', imgErr.message);
                    }

                    propertiesCreated++;
                    await sleep(100); // Small delay between properties
                }

                await sleep(200); // Delay between sellers to ease DB load

            } catch (err) {
                console.error(`Error creating seller ${i}:`, err.message);
                // Continue with next user despite error
            }
        }

        console.log('------------------------------------------------');
        console.log(`Successfully created ${sellersCreated} sellers and ${propertiesCreated} properties.`);
        console.log('------------------------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('Fatal Error seeding data:', error);
        process.exit(1);
    }
}

seedRealSellers();
