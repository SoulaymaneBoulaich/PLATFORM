const express = require('express');
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = express.Router();

// GET /api/messages/conversations/:conversationId
router.get('/conversations/:conversationId', auth, messageController.getByConversation);

// POST /api/messages
router.post('/', auth, messageController.create);

// PATCH /api/messages/:id
router.patch('/:id', auth, messageController.update);

// DELETE /api/messages/:id
router.delete('/:id', auth, messageController.deleteMessage);

module.exports = router;
