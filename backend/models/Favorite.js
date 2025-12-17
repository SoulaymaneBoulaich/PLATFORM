const pool = require('../config/database');

class Favorite {
    static async getByUserId(userId) {
        const [favorites] = await pool.query(`
            SELECT 
                f.favorite_id,
                f.added_date as favorited_at,
                p.property_id,
                p.title,
                p.description,
                p.price,
                p.property_type,
                p.status,
                p.bedrooms,
                p.bathrooms,
                p.area_sqft as area,
                p.city,
                p.country,
                p.image_url,
                u.user_id as seller_id,
                u.first_name as seller_first_name,
                u.last_name as seller_last_name
            FROM favorites f
            INNER JOIN properties p ON f.property_id = p.property_id
            INNER JOIN users u ON p.seller_id = u.user_id
            WHERE f.user_id = ?
            ORDER BY f.added_date DESC
        `, [userId]);
        return favorites;
    }

    static async add(userId, propertyId) {
        const [property] = await pool.query(
            'SELECT property_id FROM properties WHERE property_id = ?',
            [propertyId]
        );

        if (property.length === 0) return { error: 'Property not found' };

        try {
            await pool.query(
                'INSERT INTO favorites (user_id, property_id) VALUES (?, ?)',
                [userId, propertyId]
            );
            return { message: 'Added' };
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return { error: 'Already in favorites' };
            }
            throw err;
        }
    }

    static async remove(userId, propertyId) {
        const [result] = await pool.query(
            'DELETE FROM favorites WHERE user_id = ? AND property_id = ?',
            [userId, propertyId]
        );
        return result.affectedRows > 0;
    }

    static async isFavorited(userId, propertyId) {
        const [result] = await pool.query(
            'SELECT favorite_id FROM favorites WHERE user_id = ? AND property_id = ?',
            [userId, propertyId]
        );
        return result.length > 0;
    }

    static async getCount(propertyId) {
        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM favorites WHERE property_id = ?',
            [propertyId]
        );
        return result[0].count;
    }
}

module.exports = Favorite;
