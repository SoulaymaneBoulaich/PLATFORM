const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/agents - Public, returns all sellers with property stats
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.profile_image_url,
                u.bio,
                u.location,
                COUNT(DISTINCT p.property_id) as property_count,
                COALESCE(AVG(r.rating), 0) as avg_rating
            FROM users u
            LEFT JOIN properties p ON u.user_id = p.seller_id AND p.status = 'active'
            LEFT JOIN reviews r ON p.property_id = r.property_id
            WHERE u.user_type = 'seller'
            GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.phone, 
                     u.profile_image_url, u.bio, u.location
            ORDER BY u.first_name ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error in GET /agents:', err);
        next(err);
    }
});

// GET /api/agents/:userId - Public, returns seller info + their properties
router.get('/:userId', async (req, res, next) => {
    try {
        const userId = req.params.userId;

        // Get seller info from users table
        const [users] = await pool.query(`
            SELECT 
                user_id, first_name, last_name, email, phone,
                profile_image_url, bio, location, user_type
            FROM users
            WHERE user_id = ? AND user_type = 'seller'
        `, [userId]);

        if (!users.length) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        const seller = users[0];

        // Fetch properties for this seller
        const [properties] = await pool.query(`
            SELECT 
                property_id, title, city, price, listing_type, status, property_type,
                address_line1, bedrooms, bathrooms, area_sqft, image_url, listing_date
            FROM properties
            WHERE seller_id = ? AND status = 'active'
            ORDER BY listing_date DESC
        `, [userId]);

        res.json({
            ...seller,
            properties
        });
    } catch (err) {
        console.error('Error in GET /agents/:userId:', err);
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
