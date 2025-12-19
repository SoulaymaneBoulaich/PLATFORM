const cloudinary = require('cloudinary').v2;

const variants = [
    {
        name: 'Original (from .env)',
        cloud_name: 'danyn3veu',
        api_key: '761587614844748',
        api_secret: 'DEHsu0CVWNsjSJlecvQqtazHRC0'
    },
    {
        name: 'Secret ending in letter O',
        cloud_name: 'danyn3veu',
        api_key: '761587614844748',
        api_secret: 'DEHsu0CVWNsjSJlecvQqtazHRCO'
    },
    {
        name: 'Secret ending in capital C small o (unlikely but possible)',
        cloud_name: 'danyn3veu',
        api_key: '761587614844748',
        api_secret: 'DEHsu0CVWNsjSJlecvQqtazHRCo'
    },
    {
        name: 'Trimmed everything rigorously',
        cloud_name: 'danyn3veu',
        api_key: '761587614844748',
        api_secret: 'DEHsu0CVWNsjSJlecvQqtazHRC0'.trim()
    }
];

async function testVariant(variant) {
    console.log(`Testing variant: ${variant.name}`);
    cloudinary.config({
        cloud_name: variant.cloud_name,
        api_key: variant.api_key,
        api_secret: variant.api_secret
    });

    return new Promise((resolve) => {
        cloudinary.api.ping((error, result) => {
            if (error) {
                console.log(`❌ Failed: ${error.message}`);
                resolve(false);
            } else {
                console.log('✅ SUCCESS!');
                console.log('CORRECT CREDENTIALS:', variant);
                resolve(true);
            }
        });
    });
}

async function run() {
    for (const variant of variants) {
        const success = await testVariant(variant);
        if (success) process.exit(0);
    }
    console.log('All variants failed.');
    process.exit(1);
}

run();
