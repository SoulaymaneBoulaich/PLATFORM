// backend/routes/contactRoutes.js
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/properties/:propertyId/contact - Submit contact form (auth required)
router.post('/properties/:propertyId/contact', auth, async (req, res, next) => {
    try {
        const { propertyId } = req.params;
        const { name, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        // Get seller_id and property title
        const [property] = await pool.query(
            'SELECT seller_id, title FROM properties WHERE property_id = ?',
            [propertyId]
        );

        if (!property || property.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const sellerId = property[0].seller_id;
        const propertyTitle = property[0].title || 'Unknown Property';

        // Save contact message
        await pool.query(
            'INSERT INTO contact_messages (property_id, seller_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?, ?)',
            [propertyId, sellerId, name, email, phone || null, message]
        );

        // Create or find conversation between buyer and seller
        let conversationId = null;

        try {
            if (sellerId && req.user && req.user.user_id) {
                const buyerId = req.user.user_id;

                // Check for existing conversation using participants table
                const [existingConv] = await pool.query(`
                    SELECT c.conversation_id 
                    FROM conversations c
                    INNER JOIN conversation_participants cp1 ON c.conversation_id = cp1.conversation_id
                    INNER JOIN conversation_participants cp2 ON c.conversation_id = cp2.conversation_id
                    WHERE c.property_id = ?
                    AND cp1.user_id = ?
                    AND cp2.user_id = ?
                    LIMIT 1
                `, [propertyId, buyerId, sellerId]);

                if (existingConv.length > 0) {
                    conversationId = existingConv[0].conversation_id;

                    // Add message
                    await pool.query(
                        'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
                        [conversationId, buyerId, message]
                    );

                    // Update timestamp
                    await pool.query(
                        'UPDATE conversations SET updated_at = NOW() WHERE conversation_id = ?',
                        [conversationId]
                    );
                } else {
                    // Create new conversation
                    const [convResult] = await pool.query(
                        'INSERT INTO conversations (property_id) VALUES (?)',
                        [propertyId]
                    );
                    conversationId = convResult.insertId;

                    // Add participants
                    await pool.query(
                        'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)',
                        [conversationId, buyerId, conversationId, sellerId]
                    );

                    // Add initial message
                    await pool.query(
                        'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
                        [conversationId, buyerId, message]
                    );
                }

                // Create notification
                await pool.query(
                    'INSERT INTO notifications (user_to_notify, user_from, property_id, type, message) VALUES (?, ?, ?, ?, ?)',
                    [sellerId, buyerId, propertyId, 'contact', `New inquiry for "${propertyTitle}"`]
                );
            }
        } catch (convError) {
            console.error('Error creating conversation:', convError);
        }

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            conversation_id: conversationId
        });
    } catch (error) {
        console.error('Error handling contact submission:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

// POST /api/contact - General contact form (no auth required)
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        await pool.query(
            'INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
            [name, email, phone || null, message]
        );

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully'
        });
    } catch (error) {
        console.error('Error handling contact submission:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
});

module.exports = router;
