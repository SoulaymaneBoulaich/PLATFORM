const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/offers/seller - Get offers for logged-in seller
router.get('/seller', auth, async (req, res, next) => {
    try {
        const sellerId = req.user.user_id;

        const [offers] = await pool.query(`
            SELECT 
                o.*,
                p.title as property_title,
                p.image_url as property_image,
                u.first_name as buyer_first_name,
                u.last_name as buyer_last_name,
                u.email as buyer_email
            FROM offers o
            JOIN properties p ON o.property_id = p.property_id
            JOIN users u ON o.buyer_id = u.user_id
            WHERE o.seller_id = ?
            ORDER BY o.created_at DESC
        `, [sellerId]);

        res.json(offers);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
