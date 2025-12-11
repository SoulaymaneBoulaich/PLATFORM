const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/agents - Public, returns all agents/sellers with property count
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
        a.agent_id, a.user_id, a.license_number, a.bio,
        u.first_name, u.last_name, u.email, u.phone,
        COUNT(p.property_id) as property_count
      FROM agents a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN properties p ON u.user_id = p.seller_id AND p.status = 'active'
      GROUP BY a.agent_id, a.user_id, a.license_number, a.bio,
               u.first_name, u.last_name, u.email, u.phone
      ORDER BY u.first_name ASC`
        );
        res.json(rows);
    } catch (err) {
        console.error('Error in GET /agents:', err);
        next(err);
    }
});

// GET /api/agents/:id - Public, returns one agent with their properties
router.get('/:id', async (req, res, next) => {
    try {
        const agentId = req.params.id;

        const [agents] = await pool.query(
            `SELECT 
        a.*, 
        u.first_name, u.last_name, u.email, u.phone
      FROM agents a
      LEFT JOIN users u ON a.user_id = u.user_id
      WHERE a.agent_id = ?`,
            [agentId]
        );

        if (!agents.length) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const agent = agents[0];

        // Fetch properties for this seller using their user_id (not agent_id)
        const [properties] = await pool.query(
            `SELECT property_id, title, city, price, listing_type, status, property_type, 
                    address_line1, bedrooms, bathrooms, area_sqft, image_url
       FROM properties
       WHERE seller_id = ? AND status = 'active'
       ORDER BY listing_date DESC`,
            [agent.user_id]  // Use user_id, not agent_id
        );

        res.json({
            ...agent,
            properties
        });
    } catch (err) {
        console.error('Error in GET /agents/:id:', err);
        next(err);
    }
});


// POST /api/agents - Admin only
router.post('/', auth, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { user_id, license_number, bio } = req.body;

        const [result] = await pool.query(
            `INSERT INTO agents (user_id, license_number, bio)
      VALUES (?, ?, ?)`,
            [user_id || null, license_number, bio]
        );

        res.status(201).json({
            message: 'Agent created successfully',
            agent_id: result.insertId
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/agents/:id - Admin or agent
router.put('/:id', auth, async (req, res, next) => {
    try {
        const agentId = req.params.id;
        const { license_number, bio } = req.body;

        const [agents] = await pool.query(
            'SELECT user_id FROM agents WHERE agent_id = ?',
            [agentId]
        );

        if (!agents.length) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const agent = agents[0];

        if (req.user.user_type !== 'admin' && req.user.user_id !== agent.user_id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await pool.query(
            `UPDATE agents 
      SET license_number = ?, bio = ?
      WHERE agent_id = ?`,
            [license_number, bio, agentId]
        );

        res.json({ message: 'Agent updated successfully' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/agents/:id - Admin only
router.delete('/:id', auth, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const agentId = req.params.id;

        const [result] = await pool.query(
            'DELETE FROM agents WHERE agent_id = ?',
            [agentId]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json({ message: 'Agent deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
