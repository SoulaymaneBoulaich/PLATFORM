const pool = require('../config/database');

class Profile {
    static async getByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT user_id, first_name, last_name, email, user_type, 
                    profile_image as profile_image_url, phone, bio, location 
             FROM users WHERE user_id = ?`,
            [userId]
        );
        return rows[0];
    }

    static async updateAvatar(userId, imageUrl) {
        await pool.query(
            'UPDATE users SET profile_image = ? WHERE user_id = ?',
            [imageUrl, userId]
        );
        return imageUrl;
    }
}

module.exports = Profile;
