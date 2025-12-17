const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Property = require('../models/Property');

// GET /api/appointments - Authenticated, role-based filtering
router.get('/', auth, async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const userType = req.user.user_type;

        const appointments = await Appointment.findAllByUserId(userId, userType);
        res.json(appointments);
    } catch (err) {
        next(err);
    }
});

// GET /api/appointments/:id - Authenticated, get one appointment
router.get('/:id', auth, async (req, res, next) => {
    try {
        const appointmentId = req.params.id;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Check permissions
        const userId = req.user.user_id;
        const userType = req.user.user_type;

        const canView =
            appointment.user_id === userId ||
            appointment.seller_id === userId ||
            userType === 'admin';

        if (!canView) {
            return res.status(403).json({ error: 'Not authorized to view this appointment' });
        }

        res.json(appointment);
    } catch (err) {
        next(err);
    }
});

// POST /api/appointments - Authenticated, create appointment
router.post('/', auth, async (req, res, next) => {
    try {
        const { property_id, appointment_date, notes } = req.body;
        const userId = req.user.user_id;

        if (!property_id || !appointment_date) {
            return res.status(400).json({ error: 'property_id and appointment_date are required' });
        }

        // Optionally get agent_id from the property
        const property = await Property.findById(property_id);

        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const agent_id = property.agent_id || null;

        const appointmentId = await Appointment.create(userId, property_id, agent_id, appointment_date, notes);

        res.status(201).json({
            message: 'Appointment scheduled successfully',
            appointment_id: appointmentId
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/appointments/:id - Authenticated, update appointment
router.put('/:id', auth, async (req, res, next) => {
    try {
        const appointmentId = req.params.id;
        const { appointment_date, notes, status } = req.body;

        // Get appointment to check permissions
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const userId = req.user.user_id;
        const userType = req.user.user_type;

        // Check permission: owner or seller or admin
        const canUpdate =
            appointment.user_id === userId ||
            appointment.seller_id === userId ||
            userType === 'admin';

        if (!canUpdate) {
            return res.status(403).json({ error: 'Not authorized to update this appointment' });
        }

        const updated = await Appointment.update(appointmentId, { appointment_date, notes, status });

        if (!updated) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        res.json({ message: 'Appointment updated successfully' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/appointments/:id - Authenticated, cancel appointment
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const appointmentId = req.params.id;

        // Get appointment to check permissions
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const userId = req.user.user_id;
        const userType = req.user.user_type;

        // Check permission: owner or seller or admin
        const canDelete =
            appointment.user_id === userId ||
            appointment.seller_id === userId ||
            userType === 'admin';

        if (!canDelete) {
            return res.status(403).json({ error: 'Not authorized to cancel this appointment' });
        }

        await Appointment.delete(appointmentId);

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
