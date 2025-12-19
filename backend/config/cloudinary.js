const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
    cloud_name: 'danyn3veu',
    api_key: '428549884232683',
    api_secret: 'mEyww3qkeBmEIOPACBpnOaLga2I',
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'real-estate-platform', // Folder name in Cloudinary
        resource_type: 'auto',
    },
});

module.exports = { cloudinary, storage };
