const pool = require('../config/database');

class Agent {
    static async findAll() {
        const query = `
            SELECT 
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.profile_image as profile_image_url,
                u.user_type,
                a.agent_id,
                a.agency_name,
                a.license_number,
                a.bio,
                a.experience_years,
                a.experience_years,
                u.profile_image as avatar,
                (SELECT COUNT(*) FROM properties p WHERE p.seller_id = u.user_id OR p.agent_id = a.agent_id) as property_count,
                (SELECT COUNT(*) FROM reviews r WHERE r.agent_id = a.agent_id) as review_count,
                (SELECT AVG(rating) FROM reviews r WHERE r.agent_id = a.agent_id) as avg_rating
            FROM users u
            LEFT JOIN agents a ON u.user_id = a.user_id
            WHERE u.user_type IN ('agent', 'seller')
        `;
        const [rows] = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `
            SELECT 
                a.*,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.profile_image as profile_image_url,
                u.date_registered as joined_at
            FROM agents a
            JOIN users u ON a.user_id = u.user_id
            WHERE a.user_id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    static async create(userId, agencyName, licenseNumber, bio, experienceYears, languages) {
        const query = `
            INSERT INTO agents (user_id, agency_name, license_number, bio, experience_years)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [userId, agencyName, licenseNumber, bio, experienceYears]);
        return result.insertId;
    }

    static async update(agentId, data) {
        const updates = [];
        const values = [];

        if (data.agency_name) {
            updates.push('agency_name = ?');
            values.push(data.agency_name);
        }
        if (data.license_number) {
            updates.push('license_number = ?');
            values.push(data.license_number);
        }
        if (data.bio) {
            updates.push('bio = ?');
            values.push(data.bio);
        }
        if (data.experience_years) {
            updates.push('experience_years = ?');
            values.push(data.experience_years);
        }

        if (updates.length === 0) return false;

        values.push(agentId);
        const query = `UPDATE agents SET ${updates.join(', ')} WHERE agent_id = ?`;
        await pool.query(query, values);
        return true;
    }

    static async getStats(agentId) {
        const query = `
             SELECT 
                (SELECT COUNT(*) FROM properties WHERE agent_id = ?) as active_listings,
                (SELECT COUNT(*) FROM transactions WHERE agent_id = ? AND status = 'completed') as sold_properties,
                (SELECT AVG(rating) FROM reviews WHERE agent_id = ?) as avg_rating
        `;
        const [rows] = await pool.query(query, [agentId, agentId, agentId]);
        return rows[0];
    }

    static async delete(agentId) {
        const [result] = await pool.query('DELETE FROM agents WHERE agent_id = ?', [agentId]);
        return result.affectedRows > 0;
    }
}

module.exports = Agent;
