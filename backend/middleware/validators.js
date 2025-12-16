/**
 * Validation middleware using express-validator
 * Provides reusable validation rules for API endpoints
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * Message validation rules
 */
exports.sendMessage = [
    body('content')
        .trim()
        .notEmpty().withMessage('Message content is required')
        .isLength({ max: 5000 }).withMessage('Message cannot exceed 5000 characters'),
    handleValidationErrors
];

exports.editMessage = [
    body('content')
        .trim()
        .notEmpty().withMessage('Message content is required')
        .isLength({ max: 5000 }).withMessage('Message cannot exceed 5000 characters'),
    handleValidationErrors
];

/**
 * Conversation validation rules
 */
exports.startConversation = [
    body('targetUserId')
        .isInt({ min: 1 }).withMessage('Valid target user ID is required'),
    body('propertyId')
        .optional()
        .isInt({ min: 1 }).withMessage('Property ID must be a valid integer'),
    handleValidationErrors
];

/**
 * Favorite validation rules
 */
exports.addFavorite = [
    body('property_id')
        .isInt({ min: 1 }).withMessage('Valid property ID is required'),
    handleValidationErrors
];

/**
 * Visit validation rules
 */
exports.createVisit = [
    body('property_id')
        .isInt({ min: 1 }).withMessage('Valid property ID is required'),
    body('scheduled_at')
        .isISO8601().withMessage('Valid date/time is required')
        .custom((value) => {
            const scheduledDate = new Date(value);
            if (scheduledDate <= new Date()) {
                throw new Error('Scheduled time must be in the future');
            }
            return true;
        }),
    body('notes')
        .optional()
        .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
    handleValidationErrors
];

exports.updateVisit = [
    body('status')
        .optional()
        .isIn(['PENDING', 'CONFIRMED', 'CANCELLED']).withMessage('Invalid status'),
    body('notes')
        .optional()
        .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
    handleValidationErrors
];

/**
 * ID parameter validation
 */
exports.validateId = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid ID'),
    handleValidationErrors
];

module.exports.handleValidationErrors = handleValidationErrors;
