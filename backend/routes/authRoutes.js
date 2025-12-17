const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database'); // Still needed for password tokens for now
const User = require('../models/User');

const router = express.Router();

// Helper function to validate password strength
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  return errors;
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      user_type,
      agency_name,
      license_id,
      preferences
    } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !user_type) {
      return res.status(400).json({
        message: 'Missing required fields',
        error: 'Email, password, first name, last name, and role are required'
      });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: 'Password does not meet requirements',
        error: passwordErrors.join('. ')
      });
    }

    // Check if email already exists
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already used' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert user
    const userId = await User.create({
      email,
      password_hash: hash,
      first_name,
      last_name,
      phone,
      user_type,
      agency_name,
      license_id,
      preferences
    });

    // Return user info (without password hash)
    res.status(201).json({
      user_id: userId,
      message: 'Registration successful'
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await User.updateLastLogin(user.user_id);

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        agency_name: user.agency_name,
        license_id: user.license_id,
        profile_image_url: user.profile_image_url,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findByEmail(email);

    // Always return success message (don't reveal if email exists for security)
    if (user) {
      const userId = user.user_id;

      // Generate secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Store token in database
      await pool.query(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );

      // In production, send email here
      // For now, log to console
      console.log(`\n🔐 Password Reset Link: http://localhost:5173/reset-password/${token}\n`);
    }

    res.json({
      message: 'If an account exists for this email, a password reset link has been sent.'
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: 'Password does not meet requirements',
        error: passwordErrors.join('. ')
      });
    }

    // Check if token exists and is valid
    const [tokens] = await pool.query(
      `SELECT user_id, expires_at, used 
       FROM password_reset_tokens 
       WHERE token = ?`,
      [token]
    );

    if (!tokens.length) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const resetToken = tokens[0];

    // Check if token is already used
    if (resetToken.used) {
      return res.status(400).json({ message: 'This reset link has already been used' });
    }

    // Check if token is expired
    if (new Date() > new Date(resetToken.expires_at)) {
      return res.status(400).json({ message: 'This reset link has expired' });
    }

    // Hash new password
    const hash = await bcrypt.hash(password, 10);

    // Update user password
    await User.updatePassword(resetToken.user_id, hash);

    // Mark token as used
    await pool.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
      [token]
    );

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

