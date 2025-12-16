const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roleMiddleware');

// GET /api/visits - Get user's property visits
router.get('/', auth, requireRole('BUYER', 'SELLER', 'AGENT'), async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const role = req.user.role || req.user.user_type;

        let query, params;

        // Buyers see their own visits, Sellers/Agents see visits to their properties
        if (role.toUpperCase() === 'BUYER') {
            query = `
        SELECT 
          v.*,
          p.title as property_title,
          p.image_url as property_image,
          p.address_line1,
          p.city,
          u.first_name as owner_first_name,
          u.last_name as owner_last_name
        FROM visits v
        INNER JOIN properties p ON v.property_id = p.property_id
        LEFT JOIN users u ON p.owner_id = u.user_id
        WHERE v.buyer_id = ?
        ORDER BY v.scheduled_at DESC
      `;
            params = [userId];
        } else {
            query = `
        SELECT 
          v.*,
          p.title as property_title,
          p.image_url as property_image,
          u.first_name as buyer_first_name,
          u.last_name as buyer_last_name,
          u.email as buyer_email
        FROM visits v
        INNER JOIN properties p ON v.property_id = p.property_id
        INNER JOIN users u ON v.buyer_id = u.user_id
        WHERE p.owner_id = ?
        ORDER BY v.scheduled_at DESC
      `;
            params = [userId];
        }

        const [visits] = await pool.query(query, params);
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
        const [property] = await pool.query(
            'SELECT property_id, owner_id FROM properties WHERE property_id = ?',
            [property_id]
        );

        if (property.length === 0) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Insert visit request
        const [result] = await pool.query(
            'INSERT INTO visits (buyer_id, property_id, scheduled_at, notes, status) VALUES (?, ?, ?, ?, ?)',
            [req.user.user_id, property_id, scheduled_at, notes || null, 'PENDING']
        );

        res.status(201).json({
            visit_id: result.insertId,
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
        const role = req.user.role || req.user.user_type;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
        if (!validStatuses.includes(status.toUpperCase())) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Get visit and check permissions
        const [visit] = await pool.query(`
      SELECT v.*, p.owner_id 
      FROM visits v
      INNER JOIN properties p ON v.property_id = p.property_id
      WHERE v.visit_id = ?
    `, [req.params.id]);

        if (visit.length === 0) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        const isOwner = visit[0].owner_id === userId;
        const isBuyer = visit[0].buyer_id === userId;

        // Only property owner can confirm, both can cancel
        if (status.toUpperCase() === 'CONFIRMED' && !isOwner) {
            return res.status(403).json({ message: 'Only property owner can confirm visits' });
        }

        if (!isOwner && !isBuyer) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update visit
        const updates = ['status = ?'];
        const params = [status.toUpperCase()];

        if (notes) {
            updates.push('notes = ?');
            params.push(notes);
        }

        params.push(req.params.id);

        await pool.query(
            `UPDATE visits SET ${updates.join(', ')} WHERE visit_id = ?`,
            params
        );

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
        const [visit] = await pool.query(`
      SELECT v.*, p.owner_id 
      FROM visits v
      INNER JOIN properties p ON v.property_id = p.property_id
      WHERE v.visit_id = ?
    `, [req.params.id]);

        if (visit.length === 0) {
            return res.status(404).json({ message: 'Visit not found' });
        }

        const isOwner = visit[0].owner_id === userId;
        const isBuyer = visit[0].buyer_id === userId;

        if (!isOwner && !isBuyer) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await pool.query('DELETE FROM visits WHERE visit_id = ?', [req.params.id]);
        res.json({ message: 'Visit deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
