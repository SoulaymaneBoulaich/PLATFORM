const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Offer = require('../models/Offer');

// GET /api/offers/seller - Get offers for logged-in seller
router.get('/seller', auth, async (req, res, next) => {
    try {
        const sellerId = req.user.user_id;
        const offers = await Offer.findAllBySellerId(sellerId);
        res.json(offers);
    } catch (err) {
        next(err);
    }
});

// PATCH /api/offers/:id - Update offer status (seller only)
router.patch('/:id', auth, async (req, res, next) => {
    try {
        const offerId = req.params.id;
        const userId = req.user.user_id;
        const { status, counter_amount, message } = req.body;

        if (!['Accepted', 'Rejected', 'Countered'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await Offer.updateStatus(offerId, status, counter_amount, message, userId);

        if (result.error) {
            if (result.error === 'Offer not found') return res.status(404).json({ error: 'Offer not found' });
            if (result.error === 'Unauthorized') return res.status(403).json({ error: 'Only the seller can update offers' });
            throw new Error(result.error);
        }

        res.json({
            offer_id: result.offer_id,
            status: result.status,
            amount: result.amount,
            message: 'Offer updated successfully'
        });
    } catch (err) {
        console.error('Error updating offer:', err);
        next(err);
    }
});

module.exports = router;
