const express = require('express');
const auth = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// GET /api/properties/:propertyId/reviews
router.get('/properties/:propertyId/reviews', reviewController.getByPropertyId);

// POST /api/reviews
router.post('/reviews', auth, reviewController.create);

// PUT /api/reviews/:id
router.put('/reviews/:id', auth, reviewController.update);

// DELETE /api/reviews/:id
router.delete('/reviews/:id', auth, reviewController.deleteReview);

module.exports = router;
