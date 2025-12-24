const express = require('express');
const auth = require('../middleware/auth');
const Favorite = require('../models/Favorite');

const router = express.Router();

// GET /api/users/:id/favorites
router.get('/:id/favorites', auth, async (req, res, next) => {
  try {
    const userId = +req.params.id;
    if (userId !== req.user.user_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const favorites = await Favorite.getByUserId(userId);
    // Note: The original returned 'rows' which was a JOIN result. 
    // Favorite.getByUserId returns the same JOIN structure.
    res.json(favorites);
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

    const result = await Favorite.add(userId, property_id);

    // Note: Original code used INSERT IGNORE, so it didn't error on duplicate.
    // The model returns { error: 'Already in favorites' } on duplicate.
    // Original code returned 201 "Added to favorites".
    // If duplicate, it just returns "Added" anyway effectively (INSERT IGNORE).
    // Or maybe insertId was 0?
    // Let's mimic original behavior: success even if duplicate? 
    // Actually the original code just said "Added to favorites".
    // If I want to be 100% compatible, I should handle duplicate gracefully.

    if (result.error && result.error !== 'Already in favorites') {
      // If property not found or other error
      if (result.error === 'Property not found') return res.status(404).json({ message: 'Property not found' });
      throw new Error(result.error);
    }

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

    await Favorite.remove(userId, propertyId);
    // Original code didn't check affectedRows, just returned success.

    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
});

const UserReview = require('../models/UserReview');

// GET /api/users/:id/reviews/stats
router.get('/:id/reviews/stats', async (req, res, next) => {
  try {
    const agentId = +req.params.id;
    const stats = await UserReview.getStats(agentId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// POST /api/users/:id/reviews
router.post('/:id/reviews', auth, async (req, res, next) => {
  try {
    const agentId = +req.params.id;
    const reviewerId = req.user.user_id; // From auth middleware
    const { rating, comment } = req.body;

    if (agentId === reviewerId) {
      return res.status(400).json({ error: 'You cannot rate yourself' });
    }

    const result = await UserReview.createOrUpdate({
      agentId,
      reviewerId,
      rating,
      comment
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
