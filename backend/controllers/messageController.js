const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const { getIo } = require('../socketHandler');

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

        // Notify Recipient
        try {
            const conversation = await Conversation.findById(conversationId);
            if (conversation) {
                const recipientId = conversation.buyer_id === senderId ? conversation.seller_id : conversation.buyer_id;

                // Fetch property details for notification
                // Assuming property_id is in conversation row, which it likely is.
                const propertyId = conversation.property_id;
                // If not, we might need to fetch it. `findById` usually joins.
                // Let's check Conversation.js to see if it joins property info.

                const notificationFull = {
                    user_to_notify: recipientId,
                    user_from: senderId,
                    property_id: propertyId,
                    type: 'message',
                    message: `New message: ${content ? (content.length > 30 ? content.substring(0, 30) + '...' : content) : 'Sent a file'}`,
                    is_read: 0,
                    created_at: new Date()
                };

                const notifId = await Notification.create(
                    notificationFull.user_to_notify,
                    notificationFull.user_from,
                    notificationFull.property_id,
                    notificationFull.type,
                    notificationFull.message
                );

                try {
                    const io = getIo();
                    io.to(recipientId).emit('notification', { ...notificationFull, notification_id: notifId });
                } catch (e) { console.error('Socket emit error:', e); }
            }
        } catch (notifErr) { console.error('Notification error:', notifErr); }

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
