const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/settings
router.get('/', auth, async (req, res, next) => {
    try {
        const [settings] = await pool.query(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [req.user.user_id]
        );

        if (settings.length === 0) {
            // Create default settings if not exists
            await pool.query(
                'INSERT INTO user_settings (user_id) VALUES (?)',
                [req.user.user_id]
            );
            const [newSettings] = await pool.query(
                'SELECT * FROM user_settings WHERE user_id = ?',
                [req.user.user_id]
            );
            return res.json(newSettings[0]);
        }

        res.json(settings[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/settings
router.put('/', auth, async (req, res, next) => {
    try {
        const {
            theme,
            notifications_email,
            notifications_push,
            notifications_marketing,
            language,
            currency,
            privacy_show_email,
            privacy_show_phone
        } = req.body;

        const updateFields = {};
        if (theme !== undefined) updateFields.theme = theme;
        if (notifications_email !== undefined) updateFields.notifications_email = notifications_email;
        if (notifications_push !== undefined) updateFields.notifications_push = notifications_push;
        if (notifications_marketing !== undefined) updateFields.notifications_marketing = notifications_marketing;
        if (language !== undefined) updateFields.language = language;
        if (currency !== undefined) updateFields.currency = currency;
        if (privacy_show_email !== undefined) updateFields.privacy_show_email = privacy_show_email;
        if (privacy_show_phone !== undefined) updateFields.privacy_show_phone = privacy_show_phone;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        await pool.query(
            'UPDATE user_settings SET ? WHERE user_id = ?',
            [updateFields, req.user.user_id]
        );

        const [updatedSettings] = await pool.query(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [req.user.user_id]
        );

        res.json(updatedSettings[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
