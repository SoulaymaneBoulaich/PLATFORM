const Transaction = require('../models/Transaction');

exports.getAll = async (req, res, next) => {
    try {
        const transactions = await Transaction.findByUserId(req.user.user_id);
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const id = await Transaction.create(req.body);
        res.status(201).json({ transaction_id: id });
    } catch (err) {
        next(err);
    }
};

exports.getByUser = async (req, res, next) => {
    try {
        const transactions = await Transaction.findByUserId(req.params.userId);
        res.json(transactions);
    } catch (err) {
        next(err);
    }
};

exports.updateStatus = async (req, res, next) => {
    try {
        const success = await Transaction.updateStatus(req.params.id, req.body.status);
        if (!success) return res.status(404).json({ message: 'Transaction not found' });
        res.json({ message: 'Status updated' });
    } catch (err) {
        next(err);
    }
};
