// backend/routes/dashboardRoutes.js
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

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

// GET /api/dashboard/seller-stats - Get seller specific statistics
router.get('/seller-stats', auth, async (req, res, next) => {
    try {
        const sellerId = req.user.user_id;

        // Parallel queries for efficiency
        const [
            [totalPropsResult],
            [activePropsResult],
            [soldPropsResult],
            [totalViewsResult],
            [contactsResult],
            [totalAgentsResult],
            propertiesByTypeResult,
            propertiesByStatusResult
        ] = await Promise.all([
            // Total properties
            pool.query('SELECT COUNT(*) as count FROM properties WHERE seller_id = ?', [sellerId]),
            // Active properties
            pool.query("SELECT COUNT(*) as count FROM properties WHERE seller_id = ? AND status = 'active'", [sellerId]),
            // Sold properties
            pool.query("SELECT COUNT(*) as count FROM properties WHERE seller_id = ? AND status = 'sold'", [sellerId]),
            // Total views (sum of views for all seller's properties)
            pool.query(`
                SELECT COUNT(pv.id) as count 
                FROM property_views pv 
                JOIN properties p ON pv.property_id = p.property_id 
                WHERE p.seller_id = ?
            `, [sellerId]),
            // Contact messages received
            pool.query('SELECT COUNT(*) as count FROM contact_messages WHERE seller_id = ?', [sellerId]),
            // Total agents/sellers count
            pool.query("SELECT COUNT(*) as count FROM users WHERE user_type IN ('seller', 'agent', 'admin')"),
            // Properties by type for this seller
            pool.query(`
                SELECT property_type, COUNT(*) as count 
                FROM properties 
                WHERE seller_id = ? 
                GROUP BY property_type 
                ORDER BY count DESC
            `, [sellerId]),
            // Properties by status for this seller
            pool.query(`
                SELECT status, COUNT(*) as count 
                FROM properties 
                WHERE seller_id = ? 
                GROUP BY status 
                ORDER BY count DESC
            `, [sellerId])
        ]);

        const propertiesByType = propertiesByTypeResult[0].map(row => ({
            type: row.property_type,
            count: row.count
        }));

        const propertiesByStatus = propertiesByStatusResult[0].map(row => ({
            status: row.status,
            count: row.count
        }));

        res.json({
            totalProperties: totalPropsResult[0].count,
            activeProperties: activePropsResult[0].count,
            soldProperties: soldPropsResult[0].count,
            totalViews: totalViewsResult[0].count,
            contactsReceived: contactsResult[0].count,
            totalAgents: totalAgentsResult[0].count,
            propertiesByType,
            propertiesByStatus
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
