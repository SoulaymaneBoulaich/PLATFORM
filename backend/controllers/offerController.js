const Offer = require('../models/Offer');

exports.createOffer = async (req, res, next) => {
    try {
        const propertyId = req.params.propertyId || req.body.propertyId;
        const buyerId = req.user.user_id;
        const { amount, message } = req.body;

        if (!propertyId || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid propertyId and amount are required' });
        }

        const result = await Offer.create(propertyId, buyerId, amount, message);

        if (result.error) {
            if (result.error === 'Property not found') return res.status(404).json({ error: 'Property not found' });
            throw new Error(result.error);
        }

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

exports.getSellerOffers = async (req, res, next) => {
    try {
        const sellerId = req.user.user_id;
        const offers = await Offer.findAllBySellerId(sellerId);
        res.json({ offers });
    } catch (err) {
        next(err);
    }
};

exports.getBuyerOffers = async (req, res, next) => {
    try {
        const buyerId = req.user.user_id;
        const offers = await Offer.findAllByBuyerId(buyerId);
        res.json({ offers });
    } catch (err) {
        next(err);
    }
};

exports.updateOfferStatus = async (req, res, next) => {
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

        res.json({ offer_id: result.offer_id, status: result.status, amount: result.amount, message: 'Offer updated successfully' });
    } catch (err) {
        next(err);
    }
};