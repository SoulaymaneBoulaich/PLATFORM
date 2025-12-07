const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone, user_type } = req.body;

    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length) {
      return res.status(400).json({ message: 'Email already used' });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hash, first_name, last_name, phone, user_type]
    );

    res.status(201).json({ user_id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
