const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// ============================================
// FAVORITES / WISHLIST ROUTES
// ============================================

// GET /api/favorites - Get all favorites for current user
router.get('/', auth, async (req, res, next) => {
    try {
        const [favorites] = await pool.query(`
            SELECT 
                f.favorite_id,
                f.added_date as favorited_at,
                p.property_id,
                p.title,
                p.description,
                p.price,
                p.property_type,
                p.status,
                p.bedrooms,
                p.bathrooms,
                p.area_sqft as area,
                p.city,
                p.country,
                p.image_url,
                u.user_id as seller_id,
                u.first_name as seller_first_name,
                u.last_name as seller_last_name
            FROM favorites f
            INNER JOIN properties p ON f.property_id = p.property_id
            INNER JOIN users u ON p.seller_id = u.user_id
            WHERE f.user_id = ?
            ORDER BY f.added_date DESC
        `, [req.user.user_id]);

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

        // Check if property exists
        const [property] = await pool.query(
            'SELECT property_id FROM properties WHERE property_id = ?',
            [property_id]
        );

        if (property.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        try {
            await pool.query(
                'INSERT INTO favorites (user_id, property_id) VALUES (?, ?)',
                [userId, property_id]
            );

            res.status(201).json({
                message: 'Property added to favorites',
                property_id: property_id
            });
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Property already in favorites' });
            }
            throw err;
        }
    } catch (err) {
        next(err);
    }
});

// DELETE /api/favorites/:propertyId - Remove property from favorites
router.delete('/:propertyId', auth, async (req, res, next) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user.user_id;

        const [result] = await pool.query(
            'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
            [userId, propertyId]
        );

        if (result.affectedRows === 0) {
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

        const [result] = await pool.query(
            'SELECT favorite_id FROM favorites WHERE user_id = ? AND property_id = ?',
            [userId, propertyId]
        );

        res.json({ is_favorited: result.length > 0 });
    } catch (err) {
        next(err);
    }
});

// GET /api/favorites/count/:propertyId - Get favorite count for a property
router.get('/count/:propertyId', async (req, res, next) => {
    try {
        const { propertyId } = req.params;

        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM favorites WHERE property_id = ?',
            [propertyId]
        );

        res.json({ count: result[0].count });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
