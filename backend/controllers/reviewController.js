const Review = require('../models/Review');

exports.getByPropertyId = async (req, res, next) => {
    try {
        const propertyId = req.params.propertyId;
        const reviews = await Review.findByPropertyId(propertyId);
        const stats = await Review.getStats(propertyId);
        res.json({ reviews, stats });
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { propertyId, rating, comment } = req.body;
        const userId = req.user.user_id;

        const result = await Review.create({ propertyId, userId, rating, comment });

        if (result.error) {
            return res.status(400).json({ error: result.error });
        }

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const result = await Review.update(req.params.id, req.user.user_id, req.body.rating);
        if (result.error) return res.status(403).json(result);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.deleteReview = async (req, res, next) => {
    try {
        const result = await Review.delete(req.params.id, req.user.user_id, req.user.user_type);
        if (result.error) return res.status(403).json(result);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
