const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// POST /properties/:id/offers - Submit an offer
router.post('/properties/:id/offers', auth, async (req, res) => {
    try {
        const propertyId = req.params.id;
        const buyerId = req.user.user_id;
        const { amount, message } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid offer amount is required' });
        }

        // Get property and seller info
        const [property] = await pool.query(
            'SELECT seller_id, title, price FROM properties WHERE property_id = ?',
            [propertyId]
        );

        if (!property || property.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const sellerId = property[0].seller_id;

        // Insert offer
        const [result] = await pool.query(
            'INSERT INTO offers (property_id, buyer_id, seller_id, amount, message) VALUES (?, ?, ?, ?, ?)',
            [propertyId, buyerId, sellerId, amount, message || null]
        );

        // Create notification for seller
        await pool.query(
            'INSERT INTO notifications (user_to_notify, user_from, property_id, type, message) VALUES (?, ?, ?, ?, ?)',
            [sellerId, buyerId, propertyId, 'offer', `New offer of $${amount} for "${property[0].title}"`]
        );

        res.status(201).json({
            offer_id: result.insertId,
            property_id: propertyId,
            amount,
            status: 'Pending',
            created_at: new Date()
        });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ error: 'Failed to create offer' });
    }
});

// GET /properties/:id/offers - Get offers for a property (seller only)
router.get('/properties/:id/offers', auth, async (req, res) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.user_id;

        // Verify user is the seller
        const [property] = await pool.query(
            'SELECT seller_id FROM properties WHERE property_id = ?',
            [propertyId]
        );

        if (!property || property.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        if (property[0].seller_id !== userId) {
            return res.status(403).json({ error: 'Only the seller can view offers' });
        }

        // Get all offers
        const [offers] = await pool.query(`
            SELECT 
                o.offer_id,
                o.property_id,
                o.buyer_id,
                o.amount,
                o.status,
                o.message,
                o.created_at,
                o.updated_at,
                u.first_name as buyer_first_name,
                u.last_name as buyer_last_name,
                u.email as buyer_email
            FROM offers o
            JOIN users u ON o.buyer_id = u.user_id
            WHERE o.property_id = ?
            ORDER BY o.created_at DESC
        `, [propertyId]);

        res.json({ offers });
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ error: 'Failed to fetch offers' });
    }
});

// PATCH /offers/:id - Update offer status (seller only)
router.patch('/offers/:id', auth, async (req, res) => {
    try {
        const offerId = req.params.id;
        const userId = req.user.user_id;
        const { status, counter_amount, message } = req.body;

        if (!['Accepted', 'Rejected', 'Countered'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Get offer details
        const [offers] = await pool.query(
            'SELECT * FROM offers WHERE offer_id = ?',
            [offerId]
        );

        if (!offers || offers.length === 0) {
            return res.status(404).json({ error: 'Offer not found' });
        }

        const offer = offers[0];

        // Verify user is the seller
        if (offer.seller_id !== userId) {
            return res.status(403).json({ error: 'Only the seller can update offers' });
        }

        // Update offer
        const updateAmount = status === 'Countered' && counter_amount ? counter_amount : offer.amount;
        await pool.query(
            'UPDATE offers SET status = ?, amount = ?, message = ? WHERE offer_id = ?',
            [status, updateAmount, message || offer.message, offerId]
        );

        // If accepted, update property status
        if (status === 'Accepted') {
            await pool.query(
                'UPDATE properties SET property_status = ? WHERE property_id = ?',
                ['Under Offer', offer.property_id]
            );
        }

        // Create notification for buyer
        const notificationMessage = status === 'Accepted'
            ? `Your offer of $${offer.amount} was accepted!`
            : status === 'Rejected'
                ? `Your offer of $${offer.amount} was rejected`
                : `Seller countered with $${counter_amount}`;

        await pool.query(
            'INSERT INTO notifications (user_to_notify, user_from, property_id, type, message) VALUES (?, ?, ?, ?, ?)',
            [offer.buyer_id, userId, offer.property_id, 'offer_update', notificationMessage]
        );

        res.json({
            offer_id: offerId,
            status,
            amount: updateAmount,
            message: 'Offer updated successfully'
        });
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ error: 'Failed to update offer' });
    }
});

// GET /dashboard/seller/summary - Seller analytics
router.get('/dashboard/seller/summary', auth, async (req, res) => {
    try {
        const sellerId = req.user.user_id;

        // Total properties
        const [totalProps] = await pool.query(
            'SELECT COUNT(*) as count FROM properties WHERE seller_id = ?',
            [sellerId]
        );

        // Active properties
        const [activeProps] = await pool.query(
            'SELECT COUNT(*) as count FROM properties WHERE seller_id = ? AND property_status = ?',
            [sellerId, 'Available']
        );

        // Sold properties
        const [soldProps] = await pool.query(
            'SELECT COUNT(*) as count FROM properties WHERE seller_id = ? AND property_status = ?',
            [sellerId, 'Sold']
        );

        // Total views
        const [views] = await pool.query(`
            SELECT COUNT(*) as count
            FROM property_views pv
            JOIN properties p ON pv.property_id = p.property_id
            WHERE p.seller_id = ?
        `, [sellerId]);

        // Total contacts/messages
        const [contacts] = await pool.query(`
            SELECT COUNT(*) as count
            FROM conversations c
            WHERE c.seller_id = ?
        `, [sellerId]);

        // Top 3 properties by views
        const [topProperties] = await pool.query(`
            SELECT 
                p.property_id,
                p.title,
                p.city,
                p.price,
                p.image_url,
                COUNT(pv.id) as view_count
            FROM properties p
            LEFT JOIN property_views pv ON p.property_id = pv.property_id
            WHERE p.seller_id = ?
            GROUP BY p.property_id
            ORDER BY view_count DESC
            LIMIT 3
        `, [sellerId]);

        res.json({
            totalProperties: totalProps[0].count,
            activeProperties: activeProps[0].count,
            soldProperties: soldProps[0].count,
            totalViews: views[0].count,
            totalContacts: contacts[0].count,
            topProperties
        });
    } catch (error) {
        console.error('Error fetching seller summary:', error);
        res.status(500).json({ error: 'Failed to fetch seller summary' });
    }
});

// GET /dashboard/buyer/summary - Buyer analytics
router.get('/dashboard/buyer/summary', auth, async (req, res) => {
    try {
        const buyerId = req.user.user_id;

        // Total favorites
        const [favorites] = await pool.query(
            'SELECT COUNT(*) as count FROM property_favorites WHERE user_id = ?',
            [buyerId]
        );

        // Saved searches
        const [searches] = await pool.query(
            'SELECT COUNT(*) as count FROM saved_searches WHERE user_id = ?',
            [buyerId]
        );

        // Recent views (last 5)
        const [recentViews] = await pool.query(`
            SELECT DISTINCT
                p.property_id,
                p.title,
                p.city,
                p.price,
                p.image_url,
                pv.viewed_at
            FROM property_views pv
            JOIN properties p ON pv.property_id = p.property_id
            WHERE pv.user_id = ?
            ORDER BY pv.viewed_at DESC
            LIMIT 5
        `, [buyerId]);

        // Pending offers
        const [offers] = await pool.query(
            'SELECT COUNT(*) as count FROM offers WHERE buyer_id = ? AND status = ?',
            [buyerId, 'Pending']
        );

        res.json({
            totalFavorites: favorites[0].count,
            savedSearches: searches[0].count,
            pendingOffers: offers[0].count,
            recentViews
        });
    } catch (error) {
        console.error('Error fetching buyer summary:', error);
        res.status(500).json({ error: 'Failed to fetch buyer summary' });
    }
});

// POST /properties/:id/view - Track property view
router.post('/properties/:id/view', async (req, res) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user?.user_id || null; // Can be null for anonymous

        await pool.query(
            'INSERT INTO property_views (property_id, user_id) VALUES (?, ?)',
            [propertyId, userId]
        );

        res.json({ message: 'View tracked' });
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({ error: 'Failed to track view' });
    }
});

// POST /properties/:id/favorite - Toggle favorite
router.post('/properties/:id/favorite', auth, async (req, res) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.user_id;

        // Check if already favorited
        const [existing] = await pool.query(
            'SELECT * FROM property_favorites WHERE property_id = ? AND user_id = ?',
            [propertyId, userId]
        );

        if (existing.length > 0) {
            // Remove favorite
            await pool.query(
                'DELETE FROM property_favorites WHERE property_id = ? AND user_id = ?',
                [propertyId, userId]
            );
            res.json({ favorited: false, message: 'Removed from favorites' });
        } else {
            // Add favorite
            await pool.query(
                'INSERT INTO property_favorites (property_id, user_id) VALUES (?, ?)',
                [propertyId, userId]
            );
            res.json({ favorited: true, message: 'Added to favorites' });
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

// GET /properties/:id/favorite-status - Check if property is favorited
router.get('/properties/:id/favorite-status', auth, async (req, res) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.user_id;

        const [favorite] = await pool.query(
            'SELECT * FROM property_favorites WHERE property_id = ? AND user_id = ?',
            [propertyId, userId]
        );

        res.json({ isFavorited: favorite.length > 0 });
    } catch (error) {
        console.error('Error checking favorite status:', error);
        res.status(500).json({ error: 'Failed to check favorite status' });
    }
});

// POST /properties/:id/viewings - Schedule a viewing
router.post('/properties/:id/viewings', auth, async (req, res) => {
    try {
        const propertyId = req.params.id;
        const buyerId = req.user.user_id;
        const { preferredDate, preferredTime, message } = req.body;

        // Get property and seller info
        const [property] = await pool.query(
            'SELECT seller_id, title FROM properties WHERE property_id = ?',
            [propertyId]
        );

        if (!property || property.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const sellerId = property[0].seller_id;

        // Create notification for seller
        await pool.query(
            'INSERT INTO notifications (user_to_notify, user_from, property_id, type, message) VALUES (?, ?, ?, ?, ?)',
            [sellerId, buyerId, propertyId, 'viewing_request', `New viewing request for "${property[0].title}" on ${preferredDate} at ${preferredTime}`]
        );

        res.status(201).json({
            message: 'Viewing request sent successfully',
            propertyId,
            preferredDate,
            preferredTime
        });
    } catch (error) {
        console.error('Error scheduling viewing:', error);
        res.status(500).json({ error: 'Failed to schedule viewing' });
    }
});

module.exports = router;
