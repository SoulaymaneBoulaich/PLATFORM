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
                // Check if conversation already exists
                const [existingConv] = await pool.query(
                    'SELECT conversation_id FROM conversations WHERE property_id = ? AND buyer_id = ? AND seller_id = ?',
                    [propertyId, req.user.user_id, sellerId]
                );

                if (existingConv.length > 0) {
                    conversationId = existingConv[0].conversation_id;

                    // Just add message to existing conversation
                    await pool.query(
                        'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
                        [conversationId, req.user.user_id, message]
                    );

                    // Update conversation last message
                    await pool.query(
                        'UPDATE conversations SET last_message = ?, last_message_at = NOW() WHERE conversation_id = ?',
                        [message, conversationId]
                    );
                } else {
                    // Create new conversation
                    const [convResult] = await pool.query(
                        'INSERT INTO conversations (property_id, buyer_id, seller_id, last_message, last_message_at) VALUES (?, ?, ?, ?, NOW())',
                        [propertyId, req.user.user_id, sellerId, message]
                    );
                    conversationId = convResult.insertId;

                    // Insert message linked to conversation
                    await pool.query(
                        'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
                        [conversationId, req.user.user_id, message]
                    );
                }

                // Create notification for seller
                await pool.query(
                    'INSERT INTO notifications (user_to_notify, user_from, property_id, type, message) VALUES (?, ?, ?, ?, ?)',
                    [sellerId, req.user.user_id, propertyId, 'contact', `New inquiry for "${propertyTitle}"`]
                );
            }
        } catch (convError) {
            // Log conversation error but don't fail the whole request
            console.error('Error creating conversation:', convError);
            // Continue without conversation - contact message was still saved
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
