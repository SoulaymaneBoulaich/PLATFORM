const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const offerController = require('../controllers/offerController');

// GET /api/offers/seller - Get offers for logged-in seller
router.get('/seller', auth, offerController.getSellerOffers);

// GET /api/offers/buyer - Get offers for logged-in buyer
router.get('/buyer', auth, offerController.getBuyerOffers);

// PATCH /api/offers/:id - Update offer status (seller only)
router.patch('/:id', auth, offerController.updateOfferStatus);

// POST /api/properties/:propertyId/offers - Submit an offer (alternate route)
// Note: property route already has POST /properties/:id/offers which uses Property controller
router.post('/properties/:propertyId', auth, offerController.createOffer);

module.exports = router;
