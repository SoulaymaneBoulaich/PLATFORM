const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id/favorites
router.get('/:id/favorites', auth, async (req, res, next) => {
  try {
    const userId = +req.params.id;
    if (userId !== req.user.user_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const [rows] = await pool.query(
      `SELECT p.* FROM favorites f
       JOIN properties p ON p.property_id = f.property_id
       WHERE f.user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/users/:id/favorites
router.post('/:id/favorites', auth, async (req, res, next) => {
  try {
    const userId = +req.params.id;
    const { property_id } = req.body;
    if (userId !== req.user.user_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await pool.query(
      'INSERT IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)',
      [userId, property_id]
    );
    res.status(201).json({ message: 'Added to favorites' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id/favorites/:propertyId
router.delete('/:id/favorites/:propertyId', auth, async (req, res, next) => {
  try {
    const userId = +req.params.id;
    const propertyId = +req.params.propertyId;
    if (userId !== req.user.user_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
