const Appointment = require('../models/Appointment');
const Property = require('../models/Property');

exports.getAppointments = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const userType = req.user.user_type;
        const appointments = await Appointment.findAllByUserId(userId, userType);
        res.json(appointments);
    } catch (err) {
        next(err);
    }
};

exports.createAppointment = async (req, res, next) => {
    try {
        const { property_id, agent_id, appointment_date, notes } = req.body;
        const user_id = req.user.user_id;

        if (!property_id || !appointment_date) {
            return res.status(400).json({ message: 'Property and date are required' });
        }

        const appointmentId = await Appointment.create(user_id, property_id, agent_id, appointment_date, notes);
        res.status(201).json({ appointment_id: appointmentId, message: 'Appointment requested' });
    } catch (err) {
        next(err);
    }
};

exports.updateAppointment = async (req, res, next) => {
    try {
        const appointmentId = req.params.id;
        const { status, notes, appointment_date } = req.body;

        // TODO: Add authorization check (only agent/admin/owner?)

        const success = await Appointment.update(appointmentId, { status, notes, appointment_date });
        if (!success) return res.status(404).json({ message: 'Appointment not found' });

        res.json({ message: 'Appointment updated' });
    } catch (err) {
        next(err);
    }
};

exports.deleteAppointment = async (req, res, next) => {
    try {
        await Appointment.delete(req.params.id);
        res.json({ message: 'Appointment cancelled' });
    } catch (err) {
        next(err);
    }
};

// Visits methods
exports.getVisits = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const role = req.user.user_type; // 'buyer' or 'seller' (for own properties)

        const visits = await Appointment.findAllVisits(userId, role);
        res.json(visits);
    } catch (err) {
        next(err);
    }
};

exports.createVisit = async (req, res, next) => {
    try {
        const { property_id, scheduled_at, notes } = req.body;
        const buyer_id = req.user.user_id;

        if (!property_id || !scheduled_at) {
            return res.status(400).json({ message: 'Property and schedule time required' });
        }

        const visitId = await Appointment.createVisit(buyer_id, property_id, scheduled_at, notes);
        res.status(201).json({ visit_id: visitId, message: 'Visit scheduled' });
    } catch (err) {
        next(err);
    }
};

exports.updateVisitStatus = async (req, res, next) => {
    try {
        const visitId = req.params.id;
        const { status, notes } = req.body;

        // TODO: Verify ownership (seller of the property)

        await Appointment.updateVisit(visitId, status, notes);
        res.json({ message: 'Visit status updated' });
    } catch (err) {
        next(err);
    }
};
