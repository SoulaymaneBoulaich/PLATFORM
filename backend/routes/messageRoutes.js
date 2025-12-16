const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { requireMessageOwnership } = require('../middleware/roleMiddleware');

// PATCH /:id - Edit a message
router.patch('/:id', auth, requireMessageOwnership(), async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Optional: Enforce edit window (15 minutes)
        const minutesSinceCreated = (new Date() - new Date(req.message.created_at)) / 60000;
        if (minutesSinceCreated > 15) {
            return res.status(400).json({ message: 'Edit window expired (15 minutes)' });
        }

        // Sanitize content
        const sanitizedContent = content.trim().slice(0, 5000);

        await pool.query(
            'UPDATE messages SET content = ?, updated_at = NOW(), is_edited = 1 WHERE message_id = ?',
            [sanitizedContent, req.params.id]
        );

        res.json({ message: 'Message updated successfully' });
    } catch (err) {
        next(err);
    }
});

// DELETE /:id - Delete a message (soft delete)
router.delete('/:id', auth, requireMessageOwnership(), async (req, res, next) => {
    try {
        await pool.query(
            'UPDATE messages SET deleted_at = NOW(), content = "[deleted]" WHERE message_id = ?',
            [req.params.id]
        );

        res.json({ message: 'Message deleted successfully' });
    } catch (err) {
        next(err);
    }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/messages';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|mp3|wav|m4a|mp4|webm|ogg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images, audio, and video files are allowed!'));
        }
    }
});

// Middleware to check conversation participation for POST routes
const requireParticipation = async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;
        const userId = req.user.user_id;

        const [rows] = await pool.query(
            'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
            [conversationId, userId]
        );

        if (rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized for this conversation' });
        }
        next();
    } catch (err) {
        next(err);
    }
};

// POST /:conversationId/audio - Upload audio message
router.post('/:conversationId/audio', auth, requireParticipation, upload.single('audio'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        const mediaUrl = `/uploads/messages/${req.file.filename}`;
        const conversationId = req.params.conversationId;
        const senderId = req.user.user_id;

        const [result] = await pool.query(
            'INSERT INTO messages (conversation_id, sender_id, content, media_url, media_type) VALUES (?, ?, ?, ?, ?)',
            [conversationId, senderId, '', mediaUrl, 'AUDIO']
        );

        // Update conversation timestamp
        await pool.query(
            'UPDATE conversations SET updated_at = NOW() WHERE conversation_id = ?',
            [conversationId]
        );

        res.status(201).json({
            message_id: result.insertId,
            media_url: mediaUrl,
            media_type: 'AUDIO',
            created_at: new Date()
        });
    } catch (err) {
        next(err);
    }
});

// POST /:conversationId/media - Upload image or video
router.post('/:conversationId/media', auth, requireParticipation, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const caption = req.body.caption || '';
        const mediaUrl = `/uploads/messages/${req.file.filename}`;
        const conversationId = req.params.conversationId;
        const senderId = req.user.user_id;

        // Determine type based on mimetype
        let mediaType = 'IMAGE';
        if (req.file.mimetype.startsWith('video/')) {
            mediaType = 'VIDEO';
        } else if (req.file.mimetype.startsWith('audio/')) {
            mediaType = 'AUDIO';
        }

        const [result] = await pool.query(
            'INSERT INTO messages (conversation_id, sender_id, content, media_url, media_type) VALUES (?, ?, ?, ?, ?)',
            [conversationId, senderId, caption, mediaUrl, mediaType]
        );

        // Update conversation timestamp
        await pool.query(
            'UPDATE conversations SET updated_at = NOW() WHERE conversation_id = ?',
            [conversationId]
        );

        res.status(201).json({
            message_id: result.insertId,
            content: caption,
            media_url: mediaUrl,
            media_type: mediaType,
            created_at: new Date()
        });
    } catch (err) {
        next(err);
    }
});


module.exports = router;
