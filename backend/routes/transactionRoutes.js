const express = require('express');
const auth = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

// GET /api/transactions
router.get('/', auth, transactionController.getAll);

// POST /api/transactions
router.post('/', auth, transactionController.create);

// GET /api/transactions/user/:userId
router.get('/user/:userId', auth, transactionController.getByUser);

// PUT /api/transactions/:id/status
router.put('/:id/status', auth, transactionController.updateStatus);

module.exports = router;
