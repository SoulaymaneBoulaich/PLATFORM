const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// GET /api/notifications - List notifications for current user
router.get('/notifications', auth, async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const notifications = await Notification.findAllByUserId(userId);
        res.json({ notifications });
    } catch (err) {
        next(err);
    }
});

// GET /api/notifications/count - Get unread notification count
router.get('/notifications/count', auth, async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const count = await Notification.getUnreadCount(userId);
        res.json({ unread_count: count });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/notifications/:id/read', auth, async (req, res, next) => {
    try {
        await Notification.markAsRead(req.params.id, req.user.user_id);
        res.json({ message: 'Marked as read' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
