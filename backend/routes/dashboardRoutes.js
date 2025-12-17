const express = require('express');
const auth = require('../middleware/auth');
const Analytics = require('../models/Analytics');

const router = express.Router();

// GET /api/dashboard/summary - Get system dashboard statistics (Admin/Sellers mostly)
// This matches the original /summary in dashboardRoutes
router.get('/summary', async (req, res, next) => {
    try {
        const stats = await Analytics.getSystemSummary();
        res.json(stats);
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/seller-stats - Get seller specific statistics
// Matches original /seller-stats in dashboardRoutes
router.get('/seller-stats', auth, async (req, res, next) => {
    try {
        const sellerId = req.user.user_id;
        const stats = await Analytics.getSellerStats(sellerId);

        // Original endpoint included totalAgents. 
        // We can get it from system summary or separate query.
        // For efficiency, we might skip it or fetch it.
        // Let's fetch it to be safe for compatibility.
        const systemStats = await Analytics.getSystemSummary();

        res.json({
            ...stats,
            totalAgents: systemStats.totalAgents
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/seller/summary - Seller analytics (Migrated from analyticsRoutes)
// Note: analyticsRoutes was mounted at /api, so path was /api/dashboard/seller/summary
// dashboardRoutes is mounted at /api/dashboard, so path is /api/dashboard/seller/summary
// This matches perfectly.
router.get('/seller/summary', auth, async (req, res, next) => {
    try {
        const sellerId = req.user.user_id;
        // The structure returned by analyticsRoutes was slightly different keys?
        // Let's check Step 648.
        // totalProperties, activeProperties, soldProperties, totalViews, totalContacts, topProperties
        // Analytics.getSellerStats returns: 
        // totalProperties, activeProperties, soldProperties, totalViews, contactsReceived, propertiesByType, propertiesByStatus

        // It's missing `topProperties` (Top 3 by views).
        // My Analytics model (Step 659) getBuyerStats has recentViews, but getSellerStats doesn't have topProperties.
        // I need to add `getSellerTopProperties` to Analytics model or just query here.
        // I will query here using logic from Step 648 to be safe and accurate, since I can't check model easily.
        // Wait, I can't query here if I want to use Models.
        // I should have added it to Analytics model.
        // I'll add `Analytics.getSellerTopProperties` logic integrated into this route for now (using pool),
        // OR add it to Analytics model in a separate step?
        // I'll put it in model? No, I'll put it INLINE here using pool for now as I missed it in model design.
        // Using pool in controller is allowed if model is missing it, but discouraged.
        // I'll use pool here to complete the task without extra steps.

        const stats = await Analytics.getSellerStats(sellerId);

        const pool = require('../config/database');
        const [topProperties] = await pool.query(`
            SELECT 
                p.property_id,
                p.title,
                p.city,
                p.price,
                p.image_url,
                COUNT(pv.id) as view_count
            FROM properties p
            LEFT JOIN property_views pv ON p.property_id = pv.property_id
            WHERE p.seller_id = ?
            GROUP BY p.property_id
            ORDER BY view_count DESC
            LIMIT 3
        `, [sellerId]);

        res.json({
            totalProperties: stats.totalProperties,
            activeProperties: stats.activeProperties,
            soldProperties: stats.soldProperties,
            totalViews: stats.totalViews,
            totalContacts: stats.contactsReceived,
            topProperties
        });
    } catch (err) {
        console.error('Error fetching seller summary:', err);
        next(err);
    }
});

// GET /api/dashboard/buyer/summary - Buyer analytics (Migrated from analyticsRoutes)
router.get('/buyer/summary', auth, async (req, res, next) => {
    try {
        const buyerId = req.user.user_id;
        const stats = await Analytics.getBuyerStats(buyerId);
        res.json(stats);
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/seller/charts - Get historical data for charts (Migrated from analyticsRoutes)
router.get('/seller/charts', auth, async (req, res, next) => {
    try {
        const sellerId = req.user.user_id;
        const charts = await Analytics.getSellerCharts(sellerId);
        res.json(charts);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
