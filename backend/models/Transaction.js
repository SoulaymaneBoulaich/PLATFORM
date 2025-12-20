const pool = require('../config/database');

class Transaction {
    static async findAll(filters) {
        const { property_id, seller_id, status } = filters;
        let sql = `
            SELECT 
                t.*,
                p.title as property_title,
                p.city as property_city,
                u.first_name as seller_first_name,
                u.last_name as seller_last_name
            FROM transactions t
            LEFT JOIN properties p ON t.property_id = p.property_id
            LEFT JOIN users u ON t.seller_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        if (property_id) {
            sql += ' AND t.property_id = ?';
            params.push(property_id);
        }
        if (seller_id) {
            sql += ' AND t.seller_id = ?';
            params.push(seller_id);
        }
        if (status) {
            sql += ' AND t.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY t.created_at DESC';

        const [rows] = await pool.query(sql, params);
        return rows;
    }

    static async findByUserId(userId) {
        return this.findAll({ seller_id: userId });
    }

    static async findById(id) {
        const query = `
            SELECT 
                t.*,
                p.title as property_title,
                p.city as property_city,
                u.first_name as seller_first_name,
                u.last_name as seller_last_name
            FROM transactions t
            LEFT JOIN properties p ON t.property_id = p.property_id
            LEFT JOIN users u ON t.seller_id = u.user_id
            WHERE t.transaction_id = ?
        `;
        const [rows] = await pool.query(query, [id]);
        return rows[0];
    }

    static async create(data) {
        const { property_id, seller_id, amount, type, status } = data;
        const [result] = await pool.query(
            `INSERT INTO transactions (property_id, seller_id, amount, type, status)
             VALUES (?, ?, ?, ?, ?)`,
            [
                property_id,
                seller_id,
                amount,
                type || 'payment',
                status || 'pending'
            ]
        );
        return result.insertId;
    }

    static async update(id, data) {
        const { status, amount, type } = data;
        const updates = [];
        const params = [];

        if (status) {
            updates.push('status = ?');
            params.push(status);
        }
        if (amount !== undefined) {
            updates.push('amount = ?');
            params.push(amount);
        }
        if (type) {
            updates.push('type = ?');
            params.push(type);
        }

        if (updates.length === 0) return false;

        params.push(id);

        const [result] = await pool.query(
            `UPDATE transactions SET ${updates.join(', ')} WHERE transaction_id = ?`,
            params
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM transactions WHERE transaction_id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Transaction;
