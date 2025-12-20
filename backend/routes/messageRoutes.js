const express = require('express');
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = express.Router();

// GET /api/messages/conversations/:conversationId
router.get('/conversations/:conversationId', auth, messageController.getByConversation);

// POST /api/messages
router.post('/', auth, messageController.create);

// PATCH /api/messages/:id
router.patch('/:id', auth, messageController.update);

// DELETE /api/messages/:id
router.delete('/:id', auth, messageController.deleteMessage);

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'msg-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// POST /api/messages/:conversationId/audio
router.post('/:conversationId/audio', auth, upload.single('audio'), messageController.uploadAudio);

// POST /api/messages/:conversationId/media
router.post('/:conversationId/media', auth, upload.single('file'), messageController.uploadMedia);

module.exports = router;
