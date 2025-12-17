const pool = require('../config/database');

class Settings {
    static async getByUserId(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM user_settings WHERE user_id = ?',
            [userId]
        );
        return rows[0];
    }

    static async createDefault(userId) {
        await pool.query(
            'INSERT INTO user_settings (user_id) VALUES (?)',
            [userId]
        );
        return this.getByUserId(userId);
    }

    static async update(userId, data) {
        const updateFields = {};

        // Filter allowed fields directly or handle dynamic mapping
        const allowedFields = [
            'theme', 'notifications_email', 'notifications_push',
            'notifications_marketing', 'language', 'currency',
            'privacy_show_email', 'privacy_show_phone',
            'email_notifications', 'sms_notifications', 'dark_mode'
        ];

        for (const [key, value] of Object.entries(data)) {
            if (allowedFields.includes(key) && value !== undefined) {
                // Convert booleans to 1/0 for SQL if needed, though mysql2/mysqljs usually handles bools as 1/0
                // But explicit conversion is safer for BIT/TINYINT(1)
                updateFields[key] = (typeof value === 'boolean') ? (value ? 1 : 0) : value;
            }
        }

        // Handle "updated_at" if exists
        updateFields.updated_at = new Date();

        if (Object.keys(updateFields).length === 0) return null;

        await pool.query(
            'UPDATE user_settings SET ? WHERE user_id = ?',
            [updateFields, userId]
        );

        return this.getByUserId(userId);
    }
}

module.exports = Settings;
