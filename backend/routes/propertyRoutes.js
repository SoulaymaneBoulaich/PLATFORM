// backend/routes/propertyRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const Property = require('../models/Property');

const router = express.Router();

// GET /api/properties  (public: buyers & sellers)
router.get('/', async (req, res, next) => {
  try {
    const filters = req.query;
    const properties = await Property.findAll(filters);
    res.json(properties);
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/:id  (public)
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const property = await Property.findById(id);

    if (!property) return res.status(404).json({ message: 'Not found' });

    res.json(property);
  } catch (err) {
    next(err);
  }
});

// POST /api/properties  (only sellers/admin)
router.post('/', auth, async (req, res, next) => {
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
});


// PUT /api/properties/:id  (only seller who owns it or admin)
router.put('/:id', auth, async (req, res, next) => {
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
});

// DELETE /api/properties/:id  (only seller who owns it or admin)
router.delete('/:id', auth, async (req, res, next) => {
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
});

const Offer = require('../models/Offer');
const Favorite = require('../models/Favorite');
const Analytics = require('../models/Analytics');
const Appointment = require('../models/Appointment');  // For handling viewings if needed, though visitRoutes handles it primarily.

// POST /api/properties/:id/offers - Submit an offer
router.post('/:id/offers', auth, async (req, res, next) => {
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
});

// GET /api/properties/:id/offers - Get offers for a property (seller only)
router.get('/:id/offers', auth, async (req, res, next) => {
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
});

// POST /api/properties/:id/view - Track property view
router.post('/:id/view', async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user?.user_id || null;
    await Analytics.trackView(propertyId, userId);
    res.json({ message: 'View tracked' });
  } catch (err) {
    next(err);
  }
});

// POST /api/properties/:id/favorite - Toggle favorite
router.post('/:id/favorite', auth, async (req, res, next) => {
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
});

// GET /api/properties/:id/favorite-status - Check favorite status
router.get('/:id/favorite-status', auth, async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.user_id;
    const isFavorited = await Favorite.isFavorited(userId, propertyId);
    res.json({ isFavorited });
  } catch (err) {
    next(err);
  }
});

// POST /api/properties/:id/viewings - Schedule a viewing
// Note: This maps to 'visits' logic but maintains the endpoint for compatibility
router.post('/:id/viewings', auth, async (req, res, next) => {
  try {
    const { preferredDate, preferredTime, message } = req.body;
    // Construct scheduled_at from date and time or just pass specific logic.
    // Appointment.createVisit expects (buyerId, propertyId, scheduledAt, notes)
    // If preferredDate/Time provided, combine them.
    let scheduledAt = new Date(); // Default or error? 
    if (preferredDate && preferredTime) {
      scheduledAt = new Date(`${preferredDate}T${preferredTime}`);
    } else {
      // If frontend sends 'scheduled_at' or we default. 
      // The analyticsRoutes implementation accepted preferredDate/Time.
      // We'll try to support it. 
      // If this legacy endpoint is used, we'll try to map it.
      if (!preferredDate) return res.status(400).json({ error: 'Date required' });
      scheduledAt = new Date(preferredDate + (preferredTime ? 'T' + preferredTime : ''));
    }

    const visitId = await Appointment.createVisit(req.user.user_id, req.params.id, scheduledAt, message);

    // Return format matching original analyticsRoutes somewhat?
    res.status(201).json({
      message: 'Viewing request sent successfully',
      visit_id: visitId // Added ID which wasn't in original but useful
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
