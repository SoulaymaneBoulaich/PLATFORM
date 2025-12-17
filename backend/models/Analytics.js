const pool = require('../config/database');

class Analytics {
    static async getSystemSummary() {
        const [totalProps] = await pool.query('SELECT COUNT(*) as count FROM properties');

        const [propsByType] = await pool.query(
            'SELECT property_type, COUNT(*) as count FROM properties GROUP BY property_type ORDER BY count DESC'
        );

        const [propsByStatus] = await pool.query(
            'SELECT status, COUNT(*) as count FROM properties GROUP BY status ORDER BY count DESC'
        );

        const [totalAgents] = await pool.query(
            "SELECT COUNT(*) as count FROM users WHERE user_type IN ('seller', 'agent', 'admin')"
        );

        return {
            totalProperties: totalProps[0].count,
            propertiesByType: propsByType.map(r => ({ type: r.property_type, count: r.count })),
            propertiesByStatus: propsByStatus.map(r => ({ status: r.status, count: r.count })),
            totalAgents: totalAgents[0].count
        };
    }

    static async getSellerStats(sellerId) {
        // Parallel queries for efficiency
        const [
            [totalProps],
            [activeProps],
            [soldProps],
            [totalViews],
            [contacts],
            [propsByType],
            [propsByStatus]
        ] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM properties WHERE seller_id = ?', [sellerId]),
            pool.query("SELECT COUNT(*) as count FROM properties WHERE seller_id = ? AND status = 'active'", [sellerId]),
            pool.query("SELECT COUNT(*) as count FROM properties WHERE seller_id = ? AND status = 'sold'", [sellerId]),
            pool.query(`
                SELECT COUNT(pv.id) as count 
                FROM property_views pv 
                JOIN properties p ON pv.property_id = p.property_id 
                WHERE p.seller_id = ?
            `, [sellerId]),
            pool.query('SELECT COUNT(*) as count FROM contact_messages WHERE seller_id = ?', [sellerId]),
            pool.query(`
                SELECT property_type, COUNT(*) as count 
                FROM properties 
                WHERE seller_id = ? 
                GROUP BY property_type 
                ORDER BY count DESC
            `, [sellerId]),
            pool.query(`
                SELECT status, COUNT(*) as count 
                FROM properties 
                WHERE seller_id = ? 
                GROUP BY status 
                ORDER BY count DESC
            `, [sellerId])
        ]);

        return {
            totalProperties: totalProps[0].count,
            activeProperties: activeProps[0].count,
            soldProperties: soldProps[0].count,
            totalViews: totalViews[0].count,
            contactsReceived: contacts[0].count,
            propertiesByType: propsByType.map(r => ({ type: r.property_type, count: r.count })),
            propertiesByStatus: propsByStatus.map(r => ({ status: r.status, count: r.count }))
        };
    }

    static async getSellerCharts(sellerId) {
        // Views over last 30 days
        const [viewsData] = await pool.query(`
            SELECT 
                DATE(pv.viewed_at) as date,
                COUNT(*) as count
            FROM property_views pv
            JOIN properties p ON pv.property_id = p.property_id
            WHERE p.seller_id = ? 
            AND pv.viewed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(pv.viewed_at)
            ORDER BY date ASC
        `, [sellerId]);

        // Offers over last 30 days
        const [offersData] = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM offers
            WHERE seller_id = ?
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `, [sellerId]);

        return {
            views: viewsData,
            offers: offersData
        };
    }

    static async getBuyerStats(buyerId) {
        const [favorites] = await pool.query(
            'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
            [buyerId]
        );

        const [searches] = await pool.query(
            'SELECT COUNT(*) as count FROM saved_searches WHERE user_id = ?',
            [buyerId]
        );

        const [recentViews] = await pool.query(`
            SELECT DISTINCT
                p.property_id,
                p.title,
                p.city,
                p.price,
                p.image_url,
                pv.viewed_at
            FROM property_views pv
            JOIN properties p ON pv.property_id = p.property_id
            WHERE pv.user_id = ?
            ORDER BY pv.viewed_at DESC
            LIMIT 5
        `, [buyerId]);

        const [pendingOffers] = await pool.query(
            'SELECT COUNT(*) as count FROM offers WHERE buyer_id = ? AND status = ?',
            [buyerId, 'Pending']
        );

        return {
            totalFavorites: favorites[0].count,
            savedSearches: searches[0].count,
            pendingOffers: pendingOffers[0].count,
            recentViews
        };
    }

    static async trackView(propertyId, userId) {
        await pool.query(
            'INSERT INTO property_views (property_id, user_id) VALUES (?, ?)',
            [propertyId, userId]
        );
    }
}

module.exports = Analytics;
