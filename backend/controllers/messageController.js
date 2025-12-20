const Message = require('../models/Message');

exports.getByConversation = async (req, res, next) => {
    try {
        const messages = await Message.findAllByConversationId(req.params.conversationId);
        res.json(messages);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { conversationId, content, mediaUrl, mediaType } = req.body;
        const senderId = req.user.user_id;

        const messageId = await Message.create({ conversationId, senderId, content, mediaUrl, mediaType });
        res.status(201).json({ message_id: messageId });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        await Message.update(req.params.id, req.body.content);
        res.json({ message: 'Message updated' });
    } catch (err) {
        next(err);
    }
};

exports.deleteMessage = async (req, res, next) => {
    try {
        await Message.softDelete(req.params.id);
        res.json({ message: 'Message deleted' });
    } catch (err) {
        next(err);
    }
};

exports.uploadAudio = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const file = req.file;
        const senderId = req.user.user_id;

        if (!file) {
            return res.status(400).json({ message: 'No audio file uploaded' });
        }

        const mediaUrl = `/uploads/${file.filename}`;

        const messageId = await Message.create({
            conversationId,
            senderId,
            content: '',
            mediaUrl,
            mediaType: 'AUDIO'
        });

        res.status(201).json({ message_id: messageId, mediaUrl });
    } catch (err) {
        next(err);
    }
};

exports.uploadMedia = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { caption } = req.body;
        const file = req.file;
        const senderId = req.user.user_id;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const mediaUrl = `/uploads/${file.filename}`;
        let mediaType = 'IMAGE';

        if (file.mimetype.startsWith('video/')) {
            mediaType = 'VIDEO';
        }

        const messageId = await Message.create({
            conversationId,
            senderId,
            content: caption || '',
            mediaUrl,
            mediaType
        });

        res.status(201).json({ message_id: messageId, mediaUrl });
    } catch (err) {
        next(err);
    }
};
