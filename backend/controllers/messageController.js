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
