const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/transactions - List all transactions
router.get('/', auth, async (req, res, next) => {
    try {
        const { property_id, seller_id, status } = req.query;
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
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/transactions/:id - Get single transaction
router.get('/:id', auth, async (req, res, next) => {
    try {
        const transactionId = req.params.id;
        const [transactions] = await pool.query(
            `SELECT 
                t.*,
                p.title as property_title,
                p.city as property_city,
                u.first_name as seller_first_name,
                u.last_name as seller_last_name
            FROM transactions t
            LEFT JOIN properties p ON t.property_id = p.property_id
            LEFT JOIN users u ON t.seller_id = u.user_id
            WHERE t.transaction_id = ?`,
            [transactionId]
        );

        if (!transactions.length) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transactions[0]);
    } catch (err) {
        next(err);
    }
});

// POST /api/transactions - Create new transaction
router.post('/', auth, async (req, res, next) => {
    try {
        const { property_id, seller_id, amount, type, status } = req.body;

        // Validate required fields
        if (!property_id || !seller_id || !amount) {
            return res.status(400).json({ 
                error: 'property_id, seller_id, and amount are required' 
            });
        }

        // Validate property exists
        const [properties] = await pool.query(
            'SELECT property_id FROM properties WHERE property_id = ?',
            [property_id]
        );
        if (!properties.length) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Validate seller exists
        const [sellers] = await pool.query(
            'SELECT user_id FROM users WHERE user_id = ?',
            [seller_id]
        );
        if (!sellers.length) {
            return res.status(404).json({ error: 'Seller not found' });
        }

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

        res.status(201).json({
            message: 'Transaction created successfully',
            transaction_id: result.insertId
        });
    } catch (err) {
        next(err);
    }
});

// PUT /api/transactions/:id - Update transaction status
router.put('/:id', auth, async (req, res, next) => {
    try {
        const transactionId = req.params.id;
        const { status, amount, type } = req.body;

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

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(transactionId);

        const [result] = await pool.query(
            `UPDATE transactions SET ${updates.join(', ')} WHERE transaction_id = ?`,
            params
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ message: 'Transaction updated successfully' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/transactions/:id - Delete transaction (admin only)
router.delete('/:id', auth, async (req, res, next) => {
    try {
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const transactionId = req.params.id;
        const [result] = await pool.query(
            'DELETE FROM transactions WHERE transaction_id = ?',
            [transactionId]
        );

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
