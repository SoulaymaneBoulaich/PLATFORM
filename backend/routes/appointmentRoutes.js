const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/appointments - Authenticated, role-based filtering
router.get('/', auth, async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const userType = req.user.user_type;

        let query;
        let params;

        if (userType === 'buyer') {
            // Buyers see their own appointments
            query = `
        SELECT 
          a.*, 
          p.title as property_title, p.city, p.address,
          ag.first_name as agent_first_name, ag.last_name as agent_last_name
        FROM appointments a
        JOIN properties p ON a.property_id = p.property_id
        LEFT JOIN agents agt ON a.agent_id = agt.agent_id
        LEFT JOIN users ag ON agt.user_id = ag.user_id
        WHERE a.user_id = ?
        ORDER BY a.appointment_date DESC`;
            params = [userId];
        } else if (userType === 'agent') {
            // Agents see appointments for properties they manage
            query = `
        SELECT 
          a.*, 
          p.title as property_title, p.city, p.address,
          u.first_name as buyer_first_name, u.last_name as buyer_last_name, u.email as buyer_email
        FROM appointments a
        JOIN properties p ON a.property_id = p.property_id
        JOIN users u ON a.user_id = u.user_id
        WHERE a.agent_id IN (SELECT agent_id FROM agents WHERE user_id = ?)
        ORDER BY a.appointment_date DESC`;
            params = [userId];
        } else if (userType === 'seller' || userType === 'admin') {
            // Sellers see appointments for their properties
            // Admins see all appointments
            if (userType === 'seller') {
                query = `
          SELECT 
            a.*, 
            p.title as property_title, p.city, p.address,
            u.first_name as buyer_first_name, u.last_name as buyer_last_name, u.email as buyer_email
          FROM appointments a
          JOIN properties p ON a.property_id = p.property_id
          JOIN users u ON a.user_id = u.user_id
          WHERE p.seller_id = ?
          ORDER BY a.appointment_date DESC`;
                params = [userId];
            } else {
                // Admin sees all
                query = `
          SELECT 
            a.*, 
            p.title as property_title, p.city, p.address,
            u.first_name as buyer_first_name, u.last_name as buyer_last_name, u.email as buyer_email
          FROM appointments a
          JOIN properties p ON a.property_id = p.property_id
          JOIN users u ON a.user_id = u.user_id
          ORDER BY a.appointment_date DESC`;
                params = [];
            }
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/appointments/:id - Authenticated, get one appointment
router.get('/:id', auth, async (req, res, next) => {
    try {
        const appointmentId = req.params.id;

        const [rows] = await pool.query(
            `SELECT 
        a.*, 
        p.title as property_title, p.city, p.address, p.seller_id,
        u.first_name as buyer_first_name, u.last_name as buyer_last_name,
        ag.first_name as agent_first_name, ag.last_name as agent_last_name
      FROM appointments a
      JOIN properties p ON a.property_id = p.property_id
      JOIN users u ON a.user_id = u.user_id
      LEFT JOIN agents agt ON a.agent_id = agt.agent_id
      LEFT JOIN users ag ON agt.user_id = ag.user_id
      WHERE a.appointment_id = ?`,
            [appointmentId]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const appointment = rows[0];

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
        const [properties] = await pool.query(
            'SELECT agent_id FROM properties WHERE property_id = ?',
            [property_id]
        );

        if (!properties.length) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const agent_id = properties[0].agent_id || null;

        const [result] = await pool.query(
            `INSERT INTO appointments (property_id, user_id, agent_id, appointment_date, notes, status)
      VALUES (?, ?, ?, ?, ?, 'scheduled')`,
            [property_id, userId, agent_id, appointment_date, notes || null]
        );

        res.status(201).json({
            message: 'Appointment scheduled successfully',
            appointment_id: result.insertId
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
        const [appointments] = await pool.query(
            `SELECT a.*, p.seller_id 
      FROM appointments a
      JOIN properties p ON a.property_id = p.property_id
      WHERE a.appointment_id = ?`,
            [appointmentId]
        );

        if (!appointments.length) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const appointment = appointments[0];
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

        // Build update query dynamically
        const updates = [];
        const values = [];

        if (appointment_date) {
            updates.push('appointment_date = ?');
            values.push(appointment_date);
        }
        if (notes !== undefined) {
            updates.push('notes = ?');
            values.push(notes);
        }
        if (status) {
            updates.push('status = ?');
            values.push(status);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(appointmentId);

        await pool.query(
            `UPDATE appointments SET ${updates.join(', ')} WHERE appointment_id = ?`,
            values
        );

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
        const [appointments] = await pool.query(
            `SELECT a.*, p.seller_id 
      FROM appointments a
      JOIN properties p ON a.property_id = p.property_id
      WHERE a.appointment_id = ?`,
            [appointmentId]
        );

        if (!appointments.length) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const appointment = appointments[0];
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

        await pool.query(
            'DELETE FROM appointments WHERE appointment_id = ?',
            [appointmentId]
        );

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
