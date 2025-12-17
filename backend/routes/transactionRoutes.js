const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Property = require('../models/Property');
const pool = require('../config/database'); // Keeping pool for user check if User model not fully ready

// GET /api/transactions - List all transactions
router.get('/', auth, async (req, res, next) => {
    try {
        const filters = req.query;
        const transactions = await Transaction.findAll(filters);
        res.json(transactions);
    } catch (err) {
        next(err);
    }
});

// GET /api/transactions/:id - Get single transaction
router.get('/:id', auth, async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json(transaction);
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

        // Validate property exists using Model
        const property = await Property.findById(property_id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Validate seller exists (Using pool directly to avoid User model dependency assumption if not imported)
        // Or better, use a simple query.
        const [sellers] = await pool.query(
            'SELECT user_id FROM users WHERE user_id = ?',
            [seller_id]
        );
        if (!sellers.length) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        const transactionId = await Transaction.create({ property_id, seller_id, amount, type, status });

        res.status(201).json({
            message: 'Transaction created successfully',
            transaction_id: transactionId
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

        if (!status && amount === undefined && !type) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const success = await Transaction.update(transactionId, { status, amount, type });

        if (!success) {
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

        const success = await Transaction.delete(req.params.id);

        if (!success) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
