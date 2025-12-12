// backend/routes/notificationRoutes.js
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications - List notifications for current user
router.get('/notifications', auth, async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        const [notifications] = await pool.query(`
            SELECT 
                n.*,
                p.title as property_title,
                p.image_url as property_image,
                u.first_name, 
                u.last_name
            FROM notifications n
            LEFT JOIN properties p ON n.property_id = p.property_id
            LEFT JOIN users u ON n.user_from = u.user_id
            WHERE n.user_to_notify = ?
            ORDER BY n.created_at DESC
            LIMIT 50
        `, [userId]);

        res.json({ notifications });
    } catch (err) {
        next(err);
    }
});

// GET /api/notifications/count - Get unread notification count
router.get('/notifications/count', auth, async (req, res, next) => {
    try {
        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_to_notify = ? AND is_read = 0',
            [req.user.user_id]
        );

        res.json({ unread_count: result[0].count });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/notifications/:id/read', auth, async (req, res, next) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_to_notify = ?',
            [req.params.id, req.user.user_id]
        );

        res.json({ message: 'Marked as read' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
