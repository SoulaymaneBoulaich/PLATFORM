const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const avatarUpload = require('../middleware/avatarUpload');
const bcrypt = require('bcryptjs');

// GET /me - Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [users] = await pool.query(
            `SELECT user_id, first_name, last_name, email, role, 
                    profile_image_url, phone, bio, location, created_at 
             FROM users WHERE user_id = ?`,
            [userId]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /me - Update profile
router.put('/me', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { first_name, last_name, phone, bio, location } = req.body;

        const updateFields = [];
        const updateValues = [];

        if (first_name !== undefined) {
            updateFields.push('first_name = ?');
            updateValues.push(first_name);
        }
        if (last_name !== undefined) {
            updateFields.push('last_name = ?');
            updateValues.push(last_name);
        }
        if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }
        if (bio !== undefined) {
            updateFields.push('bio = ?');
            updateValues.push(bio);
        }
        if (location !== undefined) {
            updateFields.push('location = ?');
            updateValues.push(location);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updateValues.push(userId);

        await pool.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
            updateValues
        );

        // Fetch updated user
        const [users] = await pool.query(
            `SELECT user_id, first_name, last_name, email, role, 
                    profile_image_url, phone, bio, location, created_at 
             FROM users WHERE user_id = ?`,
            [userId]
        );

        res.json({ message: 'Profile updated successfully', user: users[0] });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// POST /me/avatar - Upload profile image
router.post('/me/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
    try {
        const userId = req.user.user_id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const imageUrl = `/uploads/avatars/${file.filename}`;

        await pool.query(
            'UPDATE users SET profile_image_url = ? WHERE user_id = ?',
            [imageUrl, userId]
        );

        res.json({
            message: 'Avatar uploaded successfully',
            profile_image_url: imageUrl
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ error: error.message || 'Failed to upload avatar' });
    }
});

// GET /me/settings - Get user settings
router.get('/me/settings', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;

        let [settings] = await pool.query(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [userId]
        );

        // Create default settings if don't exist
        if (!settings || settings.length === 0) {
            await pool.query(
                'INSERT INTO user_settings (user_id) VALUES (?)',
                [userId]
            );

            [settings] = await pool.query(
                'SELECT * FROM user_settings WHERE user_id = ?',
                [userId]
            );
        }

        res.json(settings[0]);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUT /me/settings - Update user settings
router.put('/me/settings', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { email_notifications, sms_notifications, dark_mode, language } = req.body;

        const updateFields = [];
        const updateValues = [];

        if (email_notifications !== undefined) {
            updateFields.push('email_notifications = ?');
            updateValues.push(email_notifications ? 1 : 0);
        }
        if (sms_notifications !== undefined) {
            updateFields.push('sms_notifications = ?');
            updateValues.push(sms_notifications ? 1 : 0);
        }
        if (dark_mode !== undefined) {
            updateFields.push('dark_mode = ?');
            updateValues.push(dark_mode ? 1 : 0);
        }
        if (language !== undefined) {
            updateFields.push('language = ?');
            updateValues.push(language);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updateValues.push(userId);

        await pool.query(
            `UPDATE user_settings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
            updateValues
        );

        // Fetch updated settings
        const [settings] = await pool.query(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [userId]
        );

        res.json({ message: 'Settings updated successfully', settings: settings[0] });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// POST /me/change-password - Change password
router.post('/me/change-password', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new passwords are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Get current password from database
        const [users] = await pool.query(
            'SELECT password FROM users WHERE user_id = ?',
            [userId]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, users[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.query(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashedPassword, userId]
        );

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

module.exports = router;
