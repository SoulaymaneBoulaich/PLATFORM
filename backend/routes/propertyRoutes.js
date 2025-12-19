const express = require('express');
const auth = require('../middleware/auth');
const propertyController = require('../controllers/propertyController');

const router = express.Router();

// GET /api/properties  (public: buyers & sellers)
router.get('/', propertyController.getAll);

// GET /api/properties/:id  (public)
// Note: This must come before sub-resource routes if they conflict, but here they don't.
router.get('/:id', propertyController.getById);

// POST /api/properties  (only sellers/admin)
router.post('/', auth, propertyController.create);

// PUT /api/properties/:id  (only seller who owns it or admin)
router.put('/:id', auth, propertyController.update);

// DELETE /api/properties/:id  (only seller who owns it or admin)
router.delete('/:id', auth, propertyController.deleteProperty);

// POST /api/properties/:id/offers - Submit an offer
router.post('/:id/offers', auth, propertyController.submitOffer);

// GET /api/properties/:id/offers - Get offers for a property (seller only)
router.get('/:id/offers', auth, propertyController.getOffers);

// POST /api/properties/:id/view - Track property view
router.post('/:id/view', propertyController.trackView);

// POST /api/properties/:id/favorite - Toggle favorite
router.post('/:id/favorite', auth, propertyController.toggleFavorite);

// GET /api/properties/:id/favorite-status - Check favorite status
router.get('/:id/favorite-status', auth, propertyController.checkFavoriteStatus);

// POST /api/properties/:id/viewings - Schedule a viewing
router.post('/:id/viewings', auth, propertyController.scheduleViewing);

module.exports = router;
