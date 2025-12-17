const pool = require('../config/database');

class Review {
    static async findByPropertyId(propertyId) {
        const [reviews] = await pool.query(
            `SELECT 
        pr.review_id, pr.property_id, pr.user_id, pr.rating, pr.comment, pr.created_at,
        u.first_name, u.last_name
      FROM property_reviews pr
      LEFT JOIN users u ON pr.user_id = u.user_id
        WHERE pr.property_id = ?
        ORDER BY pr.created_at DESC`,
            [propertyId]
        );
        return reviews;
    }

    static async getStats(propertyId) {
        const [stats] = await pool.query(
            `SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as review_count
      FROM property_reviews
      WHERE property_id = ?`,
            [propertyId]
        );
        return {
            average_rating: stats[0].average_rating ? parseFloat(stats[0].average_rating.toFixed(1)) : 0,
            review_count: stats[0].review_count
        };
    }

    static async create(data) {
        const { propertyId, userId, rating, comment } = data;

        const [existing] = await pool.query(
            'SELECT review_id FROM property_reviews WHERE property_id = ? AND user_id = ?',
            [propertyId, userId]
        );

        if (existing.length > 0) return { error: 'You have already reviewed this property' };

        const [result] = await pool.query(
            `INSERT INTO property_reviews (property_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
            [propertyId, userId, rating || null, comment]
        );

        return { review_id: result.insertId };
    }

    static async update(reviewId, userId, rating) {
        const [reviews] = await pool.query(
            'SELECT user_id FROM property_reviews WHERE review_id = ?',
            [reviewId]
        );

        if (!reviews.length) return { error: 'Review not found' };
        if (reviews[0].user_id !== userId) return { error: 'You can only edit your own reviews' };

        await pool.query(
            `UPDATE property_reviews SET rating = ? WHERE review_id = ?`,
            [rating, reviewId]
        );

        return { message: 'Review updated successfully' };
    }

    static async delete(reviewId, userId, userType) {
        const [reviews] = await pool.query(
            'SELECT user_id FROM property_reviews WHERE review_id = ?',
            [reviewId]
        );

        if (!reviews.length) return { error: 'Review not found' };

        const canDelete = reviews[0].user_id === userId || userType === 'admin';
        if (!canDelete) return { error: 'You can only delete your own reviews' };

        await pool.query(
            'DELETE FROM property_reviews WHERE review_id = ?',
            [reviewId]
        );

        return { message: 'Review deleted successfully' };
    }
}

module.exports = Review;
