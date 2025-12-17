const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');
const Appointment = require('../models/Appointment');
const Property = require('../models/Property');

// GET /api/visits - Get user's property visits
router.get('/', auth, requireRole('BUYER', 'SELLER', 'AGENT'), async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const role = req.user.role || req.user.user_type;

        const visits = await Appointment.findAllVisits(userId, role);
        res.json(visits);
    } catch (err) {
        next(err);
    }
});

// POST /api/visits - Request a property visit
router.post('/', auth, requireRole('BUYER'), async (req, res, next) => {
    try {
        const { property_id, scheduled_at, notes } = req.body;

        if (!property_id || !scheduled_at) {
            return res.status(400).json({ message: 'Property ID and scheduled time are required' });
        }

        // Validate scheduled_at is in the future
        const scheduledDate = new Date(scheduled_at);
        if (scheduledDate < new Date()) {
            return res.status(400).json({ message: 'Scheduled time must be in the future' });
        }

        // Check if property exists
        const property = await Property.findById(property_id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const visitId = await Appointment.createVisit(req.user.user_id, property_id, scheduled_at, notes);

        res.status(201).json({
            visit_id: visitId,
            message: 'Visit request submitted successfully'
        });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/visits/:id - Update visit status
router.patch('/:id', auth, requireRole('SELLER', 'AGENT', 'BUYER'), async (req, res, next) => {
    try {
        const { status, notes } = req.body;
        const userId = req.user.user_id;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
        if (!validStatuses.includes(status.toUpperCase())) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Get visit and check permissions
        const visit = await Appointment.findVisitById(req.params.id);

        if (!visit) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        const isOwner = visit.owner_id === userId;
        const isBuyer = visit.buyer_id === userId;

        // Only property owner can confirm, both can cancel
        if (status.toUpperCase() === 'CONFIRMED' && !isOwner) {
            return res.status(403).json({ message: 'Only property owner can confirm visits' });
        }

        if (!isOwner && !isBuyer) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Appointment.updateVisit(req.params.id, status.toUpperCase(), notes);

        res.json({ message: 'Visit updated successfully' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/visits/:id - Cancel/delete a visit
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const userId = req.user.user_id;

        // Check if user is buyer or property owner
        const visit = await Appointment.findVisitById(req.params.id);

        if (!visit) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        const isOwner = visit.owner_id === userId;
        const isBuyer = visit.buyer_id === userId;

        if (!isOwner && !isBuyer) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Appointment.deleteVisit(req.params.id);
        res.json({ message: 'Visit deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
