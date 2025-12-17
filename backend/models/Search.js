const pool = require('../config/database');

class Search {
    static async getSuggestions(query) {
        const searchTerm = `%${query}%`;

        // Get matching cities
        const [cities] = await pool.query(`
            SELECT DISTINCT city 
            FROM properties 
            WHERE city LIKE ? 
            LIMIT 10
        `, [searchTerm]);

        // Get matching property titles
        const [properties] = await pool.query(`
            SELECT property_id, title, city, price 
            FROM properties 
            WHERE title LIKE ? OR description LIKE ?
            LIMIT 10
        `, [searchTerm, searchTerm]);

        // Get matching sellers
        const [sellers] = await pool.query(`
            SELECT user_id, first_name, last_name, email
            FROM users
            WHERE role = 'seller' AND (first_name LIKE ? OR last_name LIKE ?)
            LIMIT 5
        `, [searchTerm, searchTerm]);

        return {
            cities: cities.map(c => c.city),
            properties: properties,
            sellers: sellers.map(s => ({
                id: s.user_id,
                name: `${s.first_name} ${s.last_name}`
            }))
        };
    }

    static async saveSearch(userId, name, filters) {
        const [result] = await pool.query(
            'INSERT INTO saved_searches (user_id, name, filters_json) VALUES (?, ?, ?)',
            [userId, name, JSON.stringify(filters)]
        );
        return result.insertId;
    }

    static async getSavedSearches(userId) {
        const [searches] = await pool.query(
            'SELECT id, name, filters_json as filters, created_at FROM saved_searches WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return searches.map(s => ({
            ...s,
            filters: typeof s.filters === 'string' ? JSON.parse(s.filters) : s.filters
        }));
    }

    static async deleteSavedSearch(id, userId) {
        const [result] = await pool.query(
            'DELETE FROM saved_searches WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows > 0;
    }

    static async getRecommendations(userId) {
        // Get user's last viewed/favorited properties
        const [viewedProperties] = await pool.query(`
            SELECT DISTINCT p.city, p.property_type, p.price
            FROM property_views pv
            JOIN properties p ON pv.property_id = p.property_id
            WHERE pv.user_id = ?
            ORDER BY pv.viewed_at DESC
            LIMIT 5
        `, [userId]);

        if (viewedProperties.length === 0) {
            // No history, return newest properties
            const [newProperties] = await pool.query(`
                SELECT property_id, seller_id, title, property_type, listing_type,
                       price, city, bedrooms, bathrooms, area_sqft as area, image_url
                FROM properties
                WHERE status = 'active'
                ORDER BY created_at DESC
                LIMIT 6
            `);
            return newProperties;
        }

        // Extract preferences
        const cities = [...new Set(viewedProperties.map(p => p.city))];
        const types = [...new Set(viewedProperties.map(p => p.property_type))];
        const avgPrice = viewedProperties.reduce((sum, p) => sum + parseFloat(p.price), 0) / viewedProperties.length;
        const priceMin = avgPrice * 0.8;
        const priceMax = avgPrice * 1.2;

        // Find similar properties
        const [recommendations] = await pool.query(`
            SELECT property_id, seller_id, title, property_type, listing_type,
                   price, city, bedrooms, bathrooms, area_sqft as area, image_url
            FROM properties
            WHERE status = 'active'
            AND (city IN (?) OR property_type IN (?) OR (price BETWEEN ? AND ?))
            AND property_id NOT IN (
                SELECT property_id FROM property_views WHERE user_id = ?
            )
            ORDER BY 
                CASE 
                    WHEN city IN (?) THEN 1
                    WHEN property_type IN (?) THEN 2
                    WHEN price BETWEEN ? AND ? THEN 3
                    ELSE 4
                END,
                created_at DESC
            LIMIT 6
        `, [cities, types, priceMin, priceMax, userId, cities, types, priceMin, priceMax]);

        return recommendations;
    }
}

module.exports = Search;
