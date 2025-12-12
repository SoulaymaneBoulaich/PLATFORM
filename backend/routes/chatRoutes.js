// backend/routes/chatRoutes.js
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/properties/:id/chat - Fetch messages for a property between two users
router.get('/properties/:id/chat', auth, async (req, res, next) => {
    try {
        const { id: propertyId } = req.params;
        const { otherUserId } = req.query;
        const currentUserId = req.user.user_id;

        if (!otherUserId) {
            return res.status(400).json({ error: 'otherUserId query parameter is required' });
        }

        const [messages] = await pool.query(`
            SELECT 
                m.*,
                sender.first_name as sender_first_name,
                sender.last_name as sender_last_name,
                receiver.first_name as receiver_first_name,
                receiver.last_name as receiver_last_name
            FROM messages m
            JOIN users sender ON m.sender_id = sender.user_id
            JOIN users receiver ON m.receiver_id = receiver.user_id
            WHERE m.property_id = ?
              AND ((m.sender_id = ? AND m.receiver_id = ?) 
                OR (m.sender_id = ? AND m.receiver_id = ?))
            ORDER BY m.created_at ASC
        `, [propertyId, currentUserId, otherUserId, otherUserId, currentUserId]);

        res.json({ messages });
    } catch (err) {
        next(err);
    }
});

// POST /api/properties/:id/chat - Send a message
router.post('/properties/:id/chat', auth, async (req, res, next) => {
    try {
        const { id: propertyId } = req.params;
        const { receiverId, content } = req.body;
        const senderId = req.user.user_id;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Message content is required' });
        }

        if (!receiverId) {
            return res.status(400).json({ error: 'receiverId is required' });
        }

        const [result] = await pool.query(
            'INSERT INTO messages (property_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)',
            [propertyId, senderId, receiverId, content]
        );

        res.status(201).json({
            message: 'Message sent successfully',
            message_id: result.insertId
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
