const cloudinary = require('cloudinary').v2;

// Hardcoded for testing to bypass .env issues entirely
const config = {
    cloud_name: 'danyn3veu',
    api_key: '761587614844748',
    api_secret: 'DEHsu0CVWNsjSJlecvQqtazHRC0'
};

console.log('Testing Cloudinary Auth with:', {
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret_length: config.api_secret.length
});

cloudinary.config(config);

// Try to sign a string manually to see if it generates expected signature
const params = {
    timestamp: 1234567890,
    folder: 'test'
};
const signature = cloudinary.utils.api_sign_request(params, config.api_secret);
console.log('Generated Signature:', signature);

// Attempt a simple ping/usage call
cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('❌ Authentication FAILED:', error);
    } else {
        console.log('✅ Authentication SUCCESS:', result);
    }
});
