const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create chat uploads directory if it doesn't exist
const chatUploadDir = path.join(__dirname, '../uploads/chat');
if (!fs.existsSync(chatUploadDir)) {
    fs.mkdirSync(chatUploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, chatUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const userId = req.user?.user_id || 'unknown';
        cb(null, `${uniqueSuffix}_${userId}_${file.originalname}`);
    }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'audio/webm',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDF, Word docs, and audio files are allowed.'), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload;
