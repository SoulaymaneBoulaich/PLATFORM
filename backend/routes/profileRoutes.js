const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const avatarUpload = multer({ storage });
const bcrypt = require('bcryptjs');
const Profile = require('../models/Profile');
const User = require('../models/User');
const Settings = require('../models/Settings');

// GET /me - Get current user profile
router.get('/me', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const user = await Profile.getByUserId(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
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

        const updatedUser = await User.update(userId, {
            first_name,
            last_name,
            phone,
            bio,
            location
        });

        if (!updatedUser) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        res.json({ message: 'Profile updated successfully', user: updatedUser });
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

        const imageUrl = file.path; // Cloudinary URL

        await Profile.updateAvatar(userId, imageUrl);

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

        let settings = await Settings.getByUserId(userId);

        // Create default settings if don't exist
        if (!settings) {
            settings = await Settings.createDefault(userId);
        }

        res.json(settings);
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

        const updatedSettings = await Settings.update(userId, {
            email_notifications,
            sms_notifications,
            dark_mode,
            language
        });

        if (!updatedSettings) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        res.json({ message: 'Settings updated successfully', settings: updatedSettings });
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

        // Get current password from database (Need to fetch explicitly as it's typically hidden)
        // Using pool here or need a specific method in User model. 
        // User.findById might return password_hash but the current User model returns everything via SELECT *
        // Let's verify User.js returns password_hash. Yes, SELECT * returns it.
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        // Note: The previous code was accessing `user.password`, but schema uses `password_hash`.
        // Let's check init.sql or previous authRoutes. logic. authRoutes uses `password_hash`.
        // The original profileRoutes.js line 210 used `users[0].password`, which might be a bug if the column is `password_hash`.
        // However, I should assume `password_hash` based on authRoutes.
        // Let's check `User.js` again. `findByEmail` returns `SELECT *`.
        // The original logic in `profileRoutes.js` 210 was `SELECT password FROM users`.
        // If the column name is indeed `password_hash` (as per `authRoutes.js` and `init.sql` likely), then `profileRoutes.js` WAS BUGGY or the column is named `password`?
        // In `authRoutes.js` L69 it inserts user with `password_hash`.
        // In `profileRoutes.js` L229 it updates `password = ?`.
        // Wait, did I miss something?
        // `authRoutes.js` L70: `INSERT INTO users (email, password_hash ...)`
        // `profileRoutes.js` L229 (original): `UPDATE users SET password = ?`
        // CONTRADICTION!
        // One route uses `password_hash`, the other `password`?
        // Let's check `authRoutes.js` again deeply.
        // `authRoutes.js` L104 `SELECT * FROM users`. L110 `bcrypt.compare(password, user.password_hash)`.
        // So the column is definitely `password_hash`.
        // Therefore `profileRoutes.js` L210 `SELECT password FROM users` and L229 `UPDATE users SET password` were LIKELY BROKEN or using an alias I didn't see.
        // Or maybe my `view_file` of `profileRoutes.js` was deceptive? No.
        // It seems `profileRoutes.js` had a BUG using `password` column instead of `password_hash`.
        // I should FIX THIS BUG as requested ("FIX ISSUES IF THEY APPEARD").

        // I will use `password_hash`.

        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await User.updatePassword(userId, hashedPassword);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

module.exports = router;
