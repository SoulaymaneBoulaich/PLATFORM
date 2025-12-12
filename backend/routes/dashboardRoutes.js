// backend/routes/dashboardRoutes.js
const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// GET /api/dashboard/summary - Get dashboard statistics
router.get('/summary', async (req, res, next) => {
    try {
        // Total properties
        const [totalPropsResult] = await pool.query(
            'SELECT COUNT(*) as count FROM properties'
        );
        const totalProperties = totalPropsResult[0].count;

        // Properties by type
        const [propertiesByTypeResult] = await pool.query(
            'SELECT property_type, COUNT(*) as count FROM properties GROUP BY property_type ORDER BY count DESC'
        );
        const propertiesByType = propertiesByTypeResult.map(row => ({
            type: row.property_type,
            count: row.count
        }));

        // Properties by status
        const [propertiesByStatusResult] = await pool.query(
            'SELECT status, COUNT(*) as count FROM properties GROUP BY status ORDER BY count DESC'
        );
        const propertiesByStatus = propertiesByStatusResult.map(row => ({
            status: row.status,
            count: row.count
        }));

        // Total agents/sellers - count unique users who are sellers or agents
        const [totalAgentsResult] = await pool.query(
            "SELECT COUNT(*) as count FROM users WHERE user_type IN ('seller', 'agent', 'admin')"
        );
        const totalAgents = totalAgentsResult[0].count;

        res.json({
            totalProperties,
            propertiesByType,
            propertiesByStatus,
            totalAgents
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
