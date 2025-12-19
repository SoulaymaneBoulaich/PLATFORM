const Property = require('../models/Property');
const Offer = require('../models/Offer');
const Favorite = require('../models/Favorite');
const Analytics = require('../models/Analytics');
const Appointment = require('../models/Appointment');

exports.getAll = async (req, res, next) => {
    try {
        const filters = req.query;
        const properties = await Property.findAll(filters);
        res.json(properties);
    } catch (err) {
        next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const property = await Property.findById(id);

        if (!property) return res.status(404).json({ message: 'Not found' });

        res.json(property);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        // Must be seller or admin to create properties
        if (req.user.user_type !== 'seller' && req.user.user_type !== 'admin') {
            return res.status(403).json({ error: 'Only sellers can create properties' });
        }

        const seller_id = req.user.user_id;
        const propertyData = { ...req.body, seller_id };

        if (!propertyData.address_line1 && !propertyData.address) {
            return res.status(400).json({ message: 'Address is required' });
        }

        const propertyId = await Property.create(propertyData);

        res.status(201).json({ property_id: propertyId });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        if (req.user.user_type !== 'seller' && req.user.user_type !== 'admin') {
            return res
                .status(403)
                .json({ message: 'Only sellers can update properties' });
        }

        const id = req.params.id;
        const seller_id = req.user.user_id;
        const updateData = req.body;

        const success = await Property.update(id, seller_id, updateData);

        if (!success) {
            return res
                .status(404)
                .json({ message: 'Property not found or not owner' });
        }

        res.json({ message: 'Updated' });
    } catch (err) {
        next(err);
    }
};

exports.deleteProperty = async (req, res, next) => {
    try {
        if (req.user.user_type !== 'seller' && req.user.user_type !== 'admin') {
            return res
                .status(403)
                .json({ message: 'Only sellers can delete properties' });
        }

        const id = req.params.id;
        const seller_id = req.user.user_id;

        const success = await Property.delete(id, seller_id);

        if (!success) {
            return res
                .status(404)
                .json({ message: 'Property not found or not owner' });
        }

        res.json({ message: 'Deleted' });
    } catch (err) {
        next(err);
    }
};

// Offer methods
exports.submitOffer = async (req, res, next) => {
    try {
        const propertyId = req.params.id;
        const buyerId = req.user.user_id;
        const { amount, message } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid offer amount is required' });
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

exports.getOffers = async (req, res, next) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.user_id;

        // Verify user is the seller
        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ error: 'Property not found' });

        if (property.seller_id !== userId) {
            return res.status(403).json({ error: 'Only the seller can view offers' });
        }

        const offers = await Offer.findAllByPropertyId(propertyId);
        res.json({ offers });
    } catch (err) {
        next(err);
    }
};

// Analytics/View methods
exports.trackView = async (req, res, next) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user?.user_id || null;
        await Analytics.trackView(propertyId, userId);
        res.json({ message: 'View tracked' });
    } catch (err) {
        next(err);
    }
};

// Favorite methods
exports.toggleFavorite = async (req, res, next) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.user_id;

        const isFavorited = await Favorite.isFavorited(userId, propertyId);
        if (isFavorited) {
            await Favorite.remove(userId, propertyId);
            res.json({ favorited: false, message: 'Removed from favorites' });
        } else {
            const result = await Favorite.add(userId, propertyId);
            if (result.error) return res.status(400).json({ error: result.error });
            res.json({ favorited: true, message: 'Added to favorites' });
        }
    } catch (err) {
        next(err);
    }
};

exports.checkFavoriteStatus = async (req, res, next) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.user_id;
        const isFavorited = await Favorite.isFavorited(userId, propertyId);
        res.json({ isFavorited });
    } catch (err) {
        next(err);
    }
};

// Viewing/Appointment methods
exports.scheduleViewing = async (req, res, next) => {
    try {
        const { preferredDate, preferredTime, message } = req.body;

        let scheduledAt = new Date();
        if (preferredDate && preferredTime) {
            scheduledAt = new Date(`${preferredDate}T${preferredTime}`);
        } else {
            if (!preferredDate) return res.status(400).json({ error: 'Date required' });
            scheduledAt = new Date(preferredDate + (preferredTime ? 'T' + preferredTime : ''));
        }

        const visitId = await Appointment.createVisit(req.user.user_id, req.params.id, scheduledAt, message);

        res.status(201).json({
            message: 'Viewing request sent successfully',
            visit_id: visitId
        });
    } catch (err) {
        next(err);
    }
};
