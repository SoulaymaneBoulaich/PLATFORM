const cloudinary = require('cloudinary').v2;

// Hardcoded NEW credentials from user
const config = {
    cloud_name: 'danyn3veu',
    api_key: '428549884232683',
    api_secret: 'mEyww3qkeBmEIOPACBpnOaLga2I'
};

console.log('Testing NEW Cloudinary Auth with:', {
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret_length: config.api_secret.length
});

cloudinary.config(config);

// Attempt a simple ping
cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('❌ Authentication FAILED:', error);
    } else {
        console.log('✅ Authentication SUCCESS:', result);
    }
});
