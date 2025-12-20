const express = require('express');
const auth = require('../middleware/auth');
const agentController = require('../controllers/agentController');

const router = express.Router();

// Routes are handled by controller below
// GET /api/agents
router.get('/', agentController.getAll);
// GET /api/agents/:userId
router.get('/:userId', agentController.getById);

// POST /api/agents - Admin only
router.post('/', auth, agentController.create);

// PUT /api/agents/:id
router.put('/:id', auth, agentController.update);

// DELETE /api/agents/:id - Admin only
router.delete('/:id', auth, agentController.deleteAgent);

module.exports = router;
