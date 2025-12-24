const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requireConversationParticipant } = require('../middleware/roleMiddleware');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// ============================================
// CONVERSATION MANAGEMENT
// ============================================

// POST /api/conversations/start - Start or get existing conversation
router.post('/start', auth, async (req, res, next) => {
  try {
    const { targetUserId, propertyId = null } = req.body;
    const userId = req.user.user_id;

    // Validate input
    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }

    if (userId === parseInt(targetUserId)) {
      return res.status(400).json({ message: 'Cannot start conversation with yourself' });
    }

    const result = await Conversation.start(userId, targetUserId, propertyId);

    if (result.error) {
      if (result.error === 'Target user not found') return res.status(404).json({ message: result.error });
      throw new Error(result.error);
    }

    if (!result.created) {
      return res.json(result);
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/conversations - List user's conversations
router.get('/', auth, async (req, res, next) => {
  try {
    const conversations = await Conversation.findAllByUserId(req.user.user_id);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

// GET /api/conversations/:id - Get conversation details
router.get('/:id', auth, requireConversationParticipant(), async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (err) {
    next(err);
  }
});

// ============================================
// MESSAGE OPERATIONS
// ============================================

// GET /api/conversations/:id/messages - Get messages in a conversation
router.get('/:id/messages', auth, requireConversationParticipant(), async (req, res, next) => {
  try {
    const messages = await Message.findAllByConversationId(req.params.id);
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

// POST /api/conversations/:id/messages - Send a message
router.post('/:id/messages', auth, requireConversationParticipant(), async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Sanitize content (basic XSS prevention)
    const sanitizedContent = content.trim().slice(0, 5000); // Limit to 5000 chars

    const messageId = await Message.create({
      conversationId: req.params.id,
      senderId: req.user.user_id,
      content: sanitizedContent
    });

    // Update conversation timestamp
    await Conversation.updateTimestamp(req.params.id);

    res.status(201).json({
      message_id: messageId,
      created_at: new Date()
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/conversations/:id - Delete a conversation
router.delete('/:id', auth, requireConversationParticipant(), async (req, res, next) => {
  try {
    await Conversation.delete(req.params.id);
    res.json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
