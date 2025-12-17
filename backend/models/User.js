const pool = require('../config/database');

class User {
    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [id]);
        return rows[0];
    }

    static async create(userData) {
        const {
            email,
            password_hash,
            first_name,
            last_name,
            phone,
            user_type,
            agency_name,
            license_id,
            preferences
        } = userData;

        const [result] = await pool.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, agency_name, license_id, preferences)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                email,
                password_hash,
                first_name,
                last_name,
                phone || null,
                user_type,
                agency_name || null,
                license_id || null,
                preferences ? JSON.stringify(preferences) : null
            ]
        );
        return result.insertId;
    }

    static async updateLastLogin(userId) {
        await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [userId]);
    }

    static async updatePassword(userId, newPasswordHash) {
        await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newPasswordHash, userId]);
    }

    // Used for profile updates
    static async update(userId, data) {
        const updateFields = [];
        const updateValues = [];

        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(value);
            }
        }

        if (updateFields.length === 0) return null;

        updateValues.push(userId);

        await pool.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
            updateValues
        );

        return this.findById(userId);
    }
}

module.exports = User;
