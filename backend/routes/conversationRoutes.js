const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const upload = require('../middleware/chatUpload');

// GET /conversations - Get all conversations for current user
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [conversations] = await pool.query(`
            SELECT 
                c.conversation_id,
                c.property_id,
                c.buyer_id,
                c.seller_id,
                c.last_message,
                c.last_message_at,
                c.created_at,
                p.title as property_title,
                p.city as property_city,
                p.image_url as property_image,
                buyer.first_name as buyer_first_name,
                buyer.last_name as buyer_last_name,
                buyer.email as buyer_email,
                seller.first_name as seller_first_name,
                seller.last_name as seller_last_name,
                seller.email as seller_email
            FROM conversations c
            LEFT JOIN properties p ON c.property_id = p.property_id
            LEFT JOIN users buyer ON c.buyer_id = buyer.user_id
            LEFT JOIN users seller ON c.seller_id = seller.user_id
            WHERE c.buyer_id = ? OR c.seller_id = ?
            ORDER BY c.last_message_at DESC, c.created_at DESC
        `, [userId, userId]);

        // Format conversations for frontend
        const formattedConversations = conversations.map(conv => {
            const isBuyer = conv.buyer_id === userId;
            const otherUser = isBuyer ? {
                id: conv.seller_id,
                first_name: conv.seller_first_name,
                last_name: conv.seller_last_name,
                email: conv.seller_email,
                role: 'seller'
            } : {
                id: conv.buyer_id,
                first_name: conv.buyer_first_name,
                last_name: conv.buyer_last_name,
                email: conv.buyer_email,
                role: 'buyer'
            };

            return {
                conversation_id: conv.conversation_id,
                property_id: conv.property_id,
                property_title: conv.property_title,
                property_city: conv.property_city,
                property_image: conv.property_image,
                other_user: otherUser,
                last_message: conv.last_message,
                last_message_at: conv.last_message_at,
                created_at: conv.created_at
            };
        });

        res.json({ conversations: formattedConversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// GET /conversations/:id/messages - Get all messages for a conversation
router.get('/:id/messages', auth, async (req, res) => {
    try {
        const conversationId = req.params.id;
        const userId = req.user.user_id;

        // Verify user is part of this conversation
        const [conversations] = await pool.query(
            'SELECT * FROM conversations WHERE conversation_id = ? AND (buyer_id = ? OR seller_id = ?)',
            [conversationId, userId, userId]
        );

        if (conversations.length === 0) {
            return res.status(403).json({ error: 'Not authorized to access this conversation' });
        }

        const [messages] = await pool.query(`
            SELECT 
                m.message_id,
                m.conversation_id,
                m.sender_id,
                m.content,
                m.attachment_url,
                m.attachment_type,
                m.created_at,
                u.first_name as sender_first_name,
                u.last_name as sender_last_name
            FROM messages m
            LEFT JOIN users u ON m.sender_id = u.user_id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
        `, [conversationId]);

        res.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST /conversations/:id/messages - Send a message (with optional file attachment)
router.post('/:id/messages', auth, upload.single('file'), async (req, res) => {
    try {
        const conversationId = req.params.id;
        const senderId = req.user.user_id;
        const { content } = req.body;
        const file = req.file;

        // Validate: must have either content or file
        if ((!content || content.trim() === '') && !file) {
            return res.status(400).json({ error: 'Message must contain text or a file' });
        }

        // Verify user is part of this conversation
        const [conversations] = await pool.query(
            'SELECT * FROM conversations WHERE conversation_id = ? AND (buyer_id = ? OR seller_id = ?)',
            [conversationId, senderId, senderId]
        );

        if (conversations.length === 0) {
            return res.status(403).json({ error: 'Not authorized to access this conversation' });
        }

        // Determine attachment info
        let attachmentUrl = null;
        let attachmentType = null;

        if (file) {
            // Store relative path for URL
            attachmentUrl = `/uploads/chat/${file.filename}`;

            // Detect attachment type based on MIME
            if (file.mimetype.startsWith('image/')) {
                attachmentType = 'image';
            } else if (file.mimetype.startsWith('audio/')) {
                attachmentType = 'audio';
            } else if (file.mimetype === 'application/pdf' || file.mimetype.includes('word')) {
                attachmentType = 'file';
            }
        }

        // Check for video URL in content (YouTube, Vimeo)
        if (content && (content.includes('youtube.com') || content.includes('youtu.be') || content.includes('vimeo.com'))) {
            const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
            if (urlMatch) {
                attachmentUrl = urlMatch[0];
                attachmentType = 'video';
            }
        }

        // Insert message
        const [result] = await pool.query(
            'INSERT INTO messages (conversation_id, sender_id, content, attachment_url, attachment_type) VALUES (?, ?, ?, ?, ?)',
            [conversationId, senderId, content ? content.trim() : null, attachmentUrl, attachmentType]
        );

        // Update conversation's last message
        const lastMessageText = attachmentType ?
            `${attachmentType === 'image' ? '📷' : attachmentType === 'audio' ? '🎤' : attachmentType === 'file' ? '📄' : '🎥'} ${attachmentType}` :
            (content ? content.trim() : '');

        await pool.query(
            'UPDATE conversations SET last_message = ?, last_message_at = NOW() WHERE conversation_id = ?',
            [lastMessageText, conversationId]
        );

        // Fetch the newly created message with sender info
        const [newMessage] = await pool.query(`
            SELECT 
                m.message_id,
                m.conversation_id,
                m.sender_id,
                m.content,
                m.attachment_url,
                m.attachment_type,
                m.created_at,
                u.first_name as sender_first_name,
                u.last_name as sender_last_name
            FROM messages m
            LEFT JOIN users u ON m.sender_id = u.user_id
            WHERE m.message_id = ?
        `, [result.insertId]);

        res.status(201).json({ message: newMessage[0] });
    } catch (error) {
        console.error('Error sending message:', error);

        // Handle file upload errors
        if (error.message && error.message.includes('file')) {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
