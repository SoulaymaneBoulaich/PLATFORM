const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireMessageOwnership } = require('../middleware/roleMiddleware');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// PATCH /:id - Edit a message
router.patch('/:id', auth, requireMessageOwnership(), async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Optional: Enforce edit window (24 hours)
        const minutesSinceCreated = (new Date() - new Date(req.message.created_at)) / 60000;
        if (minutesSinceCreated > 1440) {
            return res.status(400).json({ message: 'Edit window expired (24 hours)' });
        }

        // Sanitize content
        const sanitizedContent = content.trim().slice(0, 5000);

        await Message.update(req.params.id, sanitizedContent);

        res.json({ message: 'Message updated successfully' });
    } catch (err) {
        next(err);
    }
});

// DELETE /:id - Delete a message (soft delete)
router.delete('/:id', auth, requireMessageOwnership(), async (req, res, next) => {
    try {
        await Message.softDelete(req.params.id);
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
        // This is simplified, strictly speaking roleMiddleware could handle this or Conversation model check
        // Ideally we should reuse Conversation participant check or assume upstream check?
        // But this is for POST to /message routes directly? No, these seem to be under /api/messages?
        // Wait, the routes in this file are /:conversationId/audio etc. so they are at root level / something.
        // Actually looking at 'conversationRoutes.js' it mounted /api/conversations.
        // looking at 'messageRoutes.js' it has `router.patch('/:id')` and `router.post('/:conversationId/audio')`.
        // This suggests this router is mounted at `/api/messages`.
        // So `/:id` refers to `/api/messages/:id`.
        // And `/:conversationId/audio` refers to `/api/messages/:conversationId/audio`.
        // The `requireParticipation` middleware here queries `conversation_participants`.

        // We can use Conversation model helper if we added one, or leave as direct query for middleware.
        // Or better, use existing middleware if available. `conversationRoutes` used `requireConversationParticipant`.
        // But that one assumed `req.params.id` is conversationId.
        // Here we have `req.params.conversationId`.
        // For now, I'll stick to the query or move logic to Conversation model.
        // `Conversation.isParticipant(conversationId, userId)` would be good.
        // But I didn't add it to Conversation model. I'll rely on the existing query logic for now, or just leave it.
        // The instruction is to replace raw SQL. I should replace it.

        // However, I haven't added isParticipant to Conversation.js. 
        // I'll skip refactoring this middleware's query for now as it's a middleware within the route file, 
        // or I can quickly add `isParticipant` to Conversation.js? 
        // No, I can't edit Conversation.js in this step easily without extra tool call.
        // I will leave the middleware query as is specifically for this step, or try to use `Conversation.findById` but that selects a lot.
        // Actually, I can just leave standard SQL for middleware if it's not a "core business logic" or if I don't want to break flow.
        // But I should try to use models.

        // Let's assume I leave the middleware verification as is for now, or use `pool` directly.
        // Wait, the `pool` variable is removed if I replaced the file content header.
        // So I MUST import pool if I keep the query.
        // Or I can rewrite it to use `Conversation.findById` which returns participants.

        const conversationId = req.params.conversationId;
        const userId = req.user.user_id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(403).json({ message: 'Not authorized' });

        // Conversation.findById returns participant_ids string "1,2"
        const participantIds = conversation.participant_ids.split(',').map(id => parseInt(id));
        if (!participantIds.includes(userId)) {
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

        const messageId = await Message.create({
            conversationId,
            senderId,
            content: '',
            mediaUrl,
            mediaType: 'AUDIO'
        });

        // Update conversation timestamp
        await Conversation.updateTimestamp(conversationId);

        res.status(201).json({
            message_id: messageId,
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

        const messageId = await Message.create({
            conversationId,
            senderId,
            content: caption,
            mediaUrl,
            mediaType
        });

        // Update conversation timestamp
        await Conversation.updateTimestamp(conversationId);

        res.status(201).json({
            message_id: messageId,
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
