const pool = require('../config/database');

class PasswordResetToken {
    static async create(userId, token, expiresAt) {
        const [result] = await pool.query(
            'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, token, expiresAt]
        );
        return result.insertId;
    }

    static async findByToken(token) {
        const [rows] = await pool.query(
            `SELECT user_id, expires_at, used 
             FROM password_reset_tokens 
             WHERE token = ?`,
            [token]
        );
        return rows[0];
    }

    static async markAsUsed(token) {
        const [result] = await pool.query(
            'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
            [token]
        );
        return result.affectedRows > 0;
    }
}

module.exports = PasswordResetToken;
