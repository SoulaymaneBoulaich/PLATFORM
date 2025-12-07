const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/database');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save to backend/uploads/
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-random-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// Configure upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: fileFilter
});

// POST /api/properties/:id/images
// Upload a single image for a property
router.post('/properties/:id/images', auth, upload.single('image'), async (req, res, next) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.user_id;
        const userType = req.user.user_type;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
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

        // Only seller who owns the property or admin can upload images
        if (property.seller_id !== userId && userType !== 'admin') {
            return res.status(403).json({ error: 'You can only upload images for your own properties' });
        }

        // Create image URL (relative path)
        const imageUrl = `/uploads/${req.file.filename}`;

        // Check if this is the first image for the property (make it primary)
        const [existingImages] = await pool.query(
            'SELECT COUNT(*) as count FROM property_images WHERE property_id = ?',
            [propertyId]
        );

        const isPrimary = existingImages[0].count === 0;

        // Insert image record into database
        const [result] = await pool.query(
            'INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)',
            [propertyId, imageUrl, isPrimary]
        );

        res.status(201).json({
            message: 'Image uploaded successfully',
            image_id: result.insertId,
            image_url: imageUrl,
            is_primary: isPrimary
        });

    } catch (error) {
        // If there's an error, delete the uploaded file
        if (req.file) {
            const fs = require('fs');
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        next(error);
    }
});

// TODO: Future enhancements
// - POST /api/properties/:id/images/bulk - Upload multiple images at once
// - DELETE /api/properties/:id/images/:imageId - Delete a specific image
// - PUT /api/properties/:id/images/:imageId/primary - Set an image as primary

module.exports = router;
