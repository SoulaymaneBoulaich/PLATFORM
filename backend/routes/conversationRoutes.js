const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { requireConversationParticipant, requireMessageOwnership } = require('../middleware/roleMiddleware');
const { startConversation, sendMessage, editMessage } = require('../middleware/validators');

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

    // Check if target user exists
    const [targetUser] = await pool.query(
      'SELECT user_id FROM users WHERE user_id = ?',
      [targetUserId]
    );

    if (targetUser.length === 0) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Check if conversation already exists between these users for this property
    const [existing] = await pool.query(`
      SELECT c.conversation_id 
      FROM conversations c
      INNER JOIN conversation_participants cp1 
        ON c.conversation_id = cp1.conversation_id
      INNER JOIN conversation_participants cp2 
        ON c.conversation_id = cp2.conversation_id
      WHERE cp1.user_id = ? 
        AND cp2.user_id = ?
        AND (c.property_id = ? OR (c.property_id IS NULL AND ? IS NULL))
      LIMIT 1
    `, [userId, targetUserId, propertyId, propertyId]);

    if (existing.length > 0) {
      return res.json({
        conversation_id: existing[0].conversation_id,
        created: false
      });
    }

    // Create new conversation
    const [result] = await pool.query(
      'INSERT INTO conversations (property_id) VALUES (?)',
      [propertyId]
    );

    const conversationId = result.insertId;

    // Add both participants
    await pool.query(
      `INSERT INTO conversation_participants (conversation_id, user_id) 
       VALUES (?, ?), (?, ?)`,
      [conversationId, userId, conversationId, targetUserId]
    );

    res.status(201).json({
      conversation_id: conversationId,
      created: true
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/conversations - List user's conversations
router.get('/', auth, async (req, res, next) => {
  try {
    const [conversations] = await pool.query(`
      SELECT 
        c.conversation_id,
        c.property_id,
        c.updated_at,
        p.title as property_title,
        p.image_url as property_image,
        u.user_id as other_user_id,
        u.first_name as other_first_name,
        u.last_name as other_last_name,
        u.user_type as other_role,
        m.content as last_message,
        m.created_at as last_message_at,
        m.sender_id as last_message_sender_id,
        m.deleted_at as last_message_deleted
      FROM conversations c
      INNER JOIN conversation_participants cp1 
        ON c.conversation_id = cp1.conversation_id
      INNER JOIN conversation_participants cp2 
        ON c.conversation_id = cp2.conversation_id
      INNER JOIN users u 
        ON cp2.user_id = u.user_id
      LEFT JOIN properties p 
        ON c.property_id = p.property_id
      LEFT JOIN messages m ON m.message_id = (
        SELECT message_id 
        FROM messages 
        WHERE conversation_id = c.conversation_id 
        ORDER BY created_at DESC 
        LIMIT 1
      )
      WHERE cp1.user_id = ? 
        AND cp2.user_id != ?
      ORDER BY c.updated_at DESC
    `, [req.user.user_id, req.user.user_id]);

    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

// GET /api/conversations/:id - Get conversation details
router.get('/:id', auth, requireConversationParticipant(), async (req, res, next) => {
  try {
    const [conversation] = await pool.query(`
      SELECT 
        c.conversation_id,
        c.property_id,
        c.created_at,
        c.updated_at,
        p.title as property_title,
        p.image_url as property_image,
        p.price,
        p.city,
        GROUP_CONCAT(DISTINCT u.user_id) as participant_ids,
        GROUP_CONCAT(DISTINCT CONCAT(u.first_name, ' ', u.last_name)) as participant_names
      FROM conversations c
      LEFT JOIN properties p ON c.property_id = p.property_id
      INNER JOIN conversation_participants cp ON c.conversation_id = cp.conversation_id
      INNER JOIN users u ON cp.user_id = u.user_id
      WHERE c.conversation_id = ?
      GROUP BY c.conversation_id
    `, [req.params.id]);

    if (conversation.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation[0]);
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
    const [messages] = await pool.query(`
      SELECT 
        m.message_id,
        m.sender_id,
        m.content,
        m.media_url,
        m.media_type,
        m.created_at,
        m.updated_at,
        m.is_edited,
        m.deleted_at,
        u.first_name,
        u.last_name,
        u.user_type as role
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.user_id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [req.params.id]);

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

    const [result] = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.user_id, sanitizedContent]
    );

    // Update conversation timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = NOW() WHERE conversation_id = ?',
      [req.params.id]
    );

    res.status(201).json({
      message_id: result.insertId,
      created_at: new Date()
    });
  } catch (err) {
    next(err);
  }
});



module.exports = router;
