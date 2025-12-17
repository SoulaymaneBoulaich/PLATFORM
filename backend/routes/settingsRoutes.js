const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Settings = require('../models/Settings');

// GET /api/settings
router.get('/', auth, async (req, res, next) => {
    try {
        let settings = await Settings.getByUserId(req.user.user_id);

        if (!settings) {
            // Create default settings if not exists
            settings = await Settings.createDefault(req.user.user_id);
        }

        res.json(settings);
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

        const updatedSettings = await Settings.update(req.user.user_id, {
            theme,
            notifications_email,
            notifications_push,
            notifications_marketing,
            language,
            currency,
            privacy_show_email,
            privacy_show_phone
        });

        if (!updatedSettings) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        res.json(updatedSettings);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
