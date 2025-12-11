const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/database');

// Helper function to validate URL format
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// POST /api/properties/:id/images
// Upload an image URL for a property
router.post('/properties/:id/images', auth, async (req, res, next) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.user_id;
        const userType = req.user.user_type;
        const { imageUrl } = req.body;

        // Check if imageUrl was provided
        if (!imageUrl) {
            return res.status(400).json({ error: 'Image URL is required' });
        }

        // Validate URL format
        if (!isValidUrl(imageUrl)) {
            return res.status(400).json({ error: 'Invalid URL format. Please provide a valid http or https URL.' });
        }

        // Verify property exists and user has permission
        const [properties] = await pool.query(
            'SELECT seller_id FROM properties WHERE property_id = ?',
            [propertyId]
        );

        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const property = properties[0];

        // Only seller who owns the property or admin can add images
        if (property.seller_id !== userId && userType !== 'admin') {
            return res.status(403).json({ error: 'You can only add images for your own properties' });
        }

        // Check if this is the first image for the property (make it primary)
        const [existingImages] = await pool.query(
            'SELECT COUNT(*) as count FROM property_images WHERE property_id = ?',
            [propertyId]
        );

        const isPrimary = existingImages[0].count === 0;

        // Insert image URL into database
        const [result] = await pool.query(
            'INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)',
            [propertyId, imageUrl, isPrimary]
        );

        res.status(201).json({
            message: 'Image URL added successfully',
            image_id: result.insertId,
            image_url: imageUrl,
            is_primary: isPrimary
        });

    } catch (error) {
        next(error);
    }
});

// DELETE /api/properties/:id/images/:imageId - Delete a specific image
router.delete('/properties/:id/images/:imageId', auth, async (req, res, next) => {
    try {
        const { id: propertyId, imageId } = req.params;
        const userId = req.user.user_id;
        const userType = req.user.user_type;

        // Verify property exists and user has permission
        const [properties] = await pool.query(
            'SELECT seller_id FROM properties WHERE property_id = ?',
            [propertyId]
        );

        if (properties.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const property = properties[0];

        if (property.seller_id !== userId && userType !== 'admin') {
            return res.status(403).json({ error: 'You can only delete images for your own properties' });
        }

        // Delete the image
        const [result] = await pool.query(
            'DELETE FROM property_images WHERE image_id = ? AND property_id = ?',
            [imageId, propertyId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.json({ message: 'Image deleted successfully' });

    } catch (error) {
        next(error);
    }
});

module.exports = router;

