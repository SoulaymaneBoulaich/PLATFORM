const express = require('express');
const auth = require('../middleware/auth');
const Review = require('../models/Review');

const router = express.Router();

// GET /api/properties/:id/reviews - Public
router.get('/properties/:id/reviews', async (req, res, next) => {
    try {
        const propertyId = req.params.id;

        const reviews = await Review.findByPropertyId(propertyId);
        const stats = await Review.getStats(propertyId);

        res.json({
            reviews,
            average_rating: stats.average_rating,
            review_count: stats.review_count
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
        const { rating, comment } = req.body;

        if (!comment || comment.trim() === '') {
            return res.status(400).json({ error: 'Comment is required' });
        }

        const result = await Review.create({ propertyId, userId, rating, comment });

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.status(201).json({
            message: 'Review submitted successfully',
            review_id: result.review_id
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

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const result = await Review.update(reviewId, userId, rating);

        if (result.error) {
            if (result.error === 'Review not found') return res.status(404).json({ error: result.error });
            if (result.error.includes('only edit')) return res.status(403).json({ error: result.error });
            throw new Error(result.error);
        }

        res.json({ message: result.message });
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

        const result = await Review.delete(reviewId, userId, userType);

        if (result.error) {
            if (result.error === 'Review not found') return res.status(404).json({ error: result.error });
            if (result.error.includes('only delete')) return res.status(403).json({ error: result.error });
            throw new Error(result.error);
        }

        res.json({ message: result.message });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
