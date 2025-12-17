const pool = require('../config/database');

class Notification {
    static async create(userToNotify, userFrom, propertyId, type, message) {
        const [result] = await pool.query(
            'INSERT INTO notifications (user_to_notify, user_from, property_id, type, message) VALUES (?, ?, ?, ?, ?)',
            [userToNotify, userFrom, propertyId, type, message]
        );
        return result.insertId;
    }

    static async findAllByUserId(userId) {
        const query = `
            SELECT 
                n.*,
                p.title as property_title,
                p.image_url as property_image,
                u.first_name, 
                u.last_name
            FROM notifications n
            LEFT JOIN properties p ON n.property_id = p.property_id
            LEFT JOIN users u ON n.user_from = u.user_id
            WHERE n.user_to_notify = ?
            ORDER BY n.created_at DESC
            LIMIT 50
        `;
        const [rows] = await pool.query(query, [userId]);
        return rows;
    }

    static async getUnreadCount(userId) {
        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_to_notify = ? AND is_read = 0',
            [userId]
        );
        return result[0].count;
    }

    static async markAsRead(notificationId, userId) {
        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_to_notify = ?',
            [notificationId, userId]
        );
        return true;
    }

    static async markAllAsRead(userId) {
        await pool.query(
            'UPDATE notifications SET is_read = 1 WHERE user_to_notify = ?',
            [userId]
        );
        return true;
    }
}

module.exports = Notification;
