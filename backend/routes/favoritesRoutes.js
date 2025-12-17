const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Favorite = require('../models/Favorite');

// ============================================
// FAVORITES / WISHLIST ROUTES
// ============================================

// GET /api/favorites - Get all favorites for current user
router.get('/', auth, async (req, res, next) => {
    try {
        const favorites = await Favorite.getByUserId(req.user.user_id);
        res.json(favorites);
    } catch (err) {
        next(err);
    }
});

// POST /api/favorites - Add property to favorites
router.post('/', auth, async (req, res, next) => {
    try {
        const { property_id } = req.body;
        const userId = req.user.user_id;

        if (!property_id) {
            return res.status(400).json({ message: 'Property ID is required' });
        }

        const result = await Favorite.add(userId, property_id);

        if (result.error) {
            if (result.error === 'Property not found') {
                return res.status(404).json({ message: 'Property not found' });
            }
            if (result.error === 'Already in favorites') {
                return res.status(400).json({ message: 'Property already in favorites' });
            }
            // Fallback for other errors if any, or throw
        }

        res.status(201).json({
            message: 'Property added to favorites',
            property_id: property_id
        });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/favorites/:propertyId - Remove property from favorites
router.delete('/:propertyId', auth, async (req, res, next) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user.user_id;

        const success = await Favorite.remove(userId, propertyId);

        if (!success) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        res.json({ message: 'Property removed from favorites' });
    } catch (err) {
        next(err);
    }
});

// GET /api/favorites/check/:propertyId - Check if property is favorited
router.get('/check/:propertyId', auth, async (req, res, next) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user.user_id;

        const isFavorited = await Favorite.isFavorited(userId, propertyId);
        res.json({ is_favorited: isFavorited });
    } catch (err) {
        next(err);
    }
});

// GET /api/favorites/count/:propertyId - Get favorite count for a property
router.get('/count/:propertyId', async (req, res, next) => {
    try {
        const { propertyId } = req.params;
        const count = await Favorite.getCount(propertyId);
        res.json({ count });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
