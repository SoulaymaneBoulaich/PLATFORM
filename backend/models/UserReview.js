const pool = require('../config/database');

class UserReview {
    static async createOrUpdate(data) {
        const { agentId, reviewerId, rating, comment } = data;

        // Check if review exists
        const [existing] = await pool.query(
            'SELECT review_id FROM user_reviews WHERE agent_id = ? AND reviewer_id = ?',
            [agentId, reviewerId]
        );

        if (existing.length > 0) {
            // Update
            await pool.query(
                `UPDATE user_reviews 
                 SET rating = ?, comment = ?, updated_at = NOW() 
                 WHERE review_id = ?`,
                [rating, comment, existing[0].review_id]
            );
            return { message: 'Review updated', reviewId: existing[0].review_id };
        } else {
            // Create
            const [result] = await pool.query(
                `INSERT INTO user_reviews (agent_id, reviewer_id, rating, comment)
                 VALUES (?, ?, ?, ?)`,
                [agentId, reviewerId, rating, comment]
            );
            return { message: 'Review created', reviewId: result.insertId };
        }
    }

    static async getStats(agentId) {
        const [stats] = await pool.query(
            `SELECT 
                AVG(rating) as average_rating,
                COUNT(*) as total_reviews,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
             FROM user_reviews
             WHERE agent_id = ?`,
            [agentId]
        );

        const s = stats[0];
        return {
            average_rating: s.average_rating ? parseFloat(s.average_rating).toFixed(1) : 0,
            total_reviews: s.total_reviews || 0,
            breakdown: {
                5: s.five_star || 0,
                4: s.four_star || 0,
                3: s.three_star || 0,
                2: s.two_star || 0,
                1: s.one_star || 0
            }
        };
    }

    static async findByAgentId(agentId) {
        const [reviews] = await pool.query(
            `SELECT r.*, u.first_name, u.last_name, u.profile_image
             FROM user_reviews r
             JOIN users u ON r.reviewer_id = u.user_id
             WHERE r.agent_id = ?
             ORDER BY r.created_at DESC`,
            [agentId]
        );
        return reviews;
    }
}

module.exports = UserReview;
