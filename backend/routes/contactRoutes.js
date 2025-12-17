// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

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

        // Save contact message used for admin purposes mostly or as backup
        await Contact.create({
            propertyId,
            sellerId,
            name,
            email,
            phone,
            message
        });

        // Create or find conversation between buyer and seller
        let conversationId = null;

        try {
            if (sellerId && req.user && req.user.user_id) {
                const buyerId = req.user.user_id;

                // Use Conversation model to start or get conversation
                const convResult = await Conversation.start(buyerId, sellerId, propertyId);

                if (convResult.conversation_id) {
                    conversationId = convResult.conversation_id;

                    // Add message using Message model
                    await Message.create({
                        conversationId,
                        senderId: buyerId,
                        content: message
                    });

                    // Update timestamp
                    await Conversation.updateTimestamp(conversationId);

                    // Create notification
                    await Contact.createNotification(sellerId, buyerId, propertyId, propertyTitle);
                }
            }
        } catch (convError) {
            console.error('Error creating conversation:', convError);
            // We continue even if conversation creation fails, as the contact form itself was submitted
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

        await Contact.create({
            propertyId: null,
            sellerId: null,
            name,
            email,
            phone,
            message
        });

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
