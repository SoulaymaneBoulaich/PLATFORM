const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/properties/:id/reviews - Public
router.get('/properties/:id/reviews', async (req, res, next) => {
    try {
        const propertyId = req.params.id;

        const [reviews] = await pool.query(
            `SELECT 
        r.review_id, r.property_id, r.user_id, r.rating, r.created_at,
        u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.property_id = ?
      ORDER BY r.created_at DESC`,
            [propertyId]
        );

        const [stats] = await pool.query(
            `SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as review_count
      FROM reviews
      WHERE property_id = ?`,
            [propertyId]
        );

        res.json({
            reviews,
            average_rating: stats[0].average_rating ? parseFloat(stats[0].average_rating.toFixed(1)) : 0,
            review_count: stats[0].review_count
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/properties/:id/reviews - Authenticated
router.post('/properties/:id/reviews', auth, async (req, res, next) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.user_id;
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const [existing] = await pool.query(
            'SELECT review_id FROM reviews WHERE property_id = ? AND user_id = ?',
            [propertyId, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'You have already reviewed this property' });
        }

        const [result] = await pool.query(
            `INSERT INTO reviews (property_id, user_id, rating)
      VALUES (?, ?, ?)`,
            [propertyId, userId, rating]
        );

        res.status(201).json({
            message: 'Review submitted successfully',
            review_id: result.insertId
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/reviews/:id - Update own review
router.put('/reviews/:id', auth, async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.user_id;
        const { rating } = req.body;

        const [reviews] = await pool.query(
            'SELECT user_id FROM reviews WHERE review_id = ?',
            [reviewId]
        );

        if (!reviews.length) {
            return res.status(404).json({ error: 'Review not found' });
        }

        if (reviews[0].user_id !== userId) {
            return res.status(403).json({ error: 'You can only edit your own reviews' });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        await pool.query(
            `UPDATE reviews SET rating = ? WHERE review_id = ?`,
            [rating, reviewId]
        );

        res.json({ message: 'Review updated successfully' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/reviews/:id - Delete own review or admin
router.delete('/reviews/:id', auth, async (req, res, next) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.user_id;
        const userType = req.user.user_type;

        const [reviews] = await pool.query(
            'SELECT user_id FROM reviews WHERE review_id = ?',
            [reviewId]
        );

        if (!reviews.length) {
            return res.status(404).json({ error: 'Review not found' });
        }

        const canDelete = reviews[0].user_id === userId || userType === 'admin';

        if (!canDelete) {
            return res.status(403).json({ error: 'You can only delete your own reviews' });
        }

        await pool.query(
            'DELETE FROM reviews WHERE review_id = ?',
            [reviewId]
        );

        res.json({ message: 'Review deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
