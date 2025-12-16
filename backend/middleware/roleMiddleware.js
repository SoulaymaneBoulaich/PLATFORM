/**
 * Role-based authorization middleware
 * Provides role checking and ownership verification for protected routes
 */

const pool = require('../config/database');

/**
 * Middleware to require specific user roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: Authentication required' });
        }

        // Normalize role comparison (handle both uppercase and lowercase)
        const userRole = req.user.role?.toUpperCase();
        const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

        if (!normalizedAllowed.includes(userRole)) {
            return res.status(403).json({
                message: 'Forbidden: Insufficient permissions',
                required: allowedRoles,
                current: req.user.role
            });
        }

        next();
    };
}

/**
 * Middleware to verify resource ownership
 * @param {string} tableName - Database table name
 * @param {string} idParam - Request parameter name containing resource ID (default: 'id')
 * @param {string} ownerField - Database column name for owner (default: 'owner_id')
 * @returns {Function} Express middleware function
 */
function requireOwnership(tableName, idParam = 'id', ownerField = 'owner_id') {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[idParam];

            if (!resourceId) {
                return res.status(400).json({ message: `Missing parameter: ${idParam}` });
            }

            // Special handling for properties table (uses seller_id, not owner_id)
            const actualOwnerField = tableName === 'properties' ? 'seller_id' : ownerField;
            const idField = tableName === 'properties' ? 'property_id' : `${tableName.slice(0, -1)}_id`;

            // Query the database to get the owner
            const [rows] = await pool.query(
                `SELECT ${actualOwnerField} as owner_id FROM ${tableName} WHERE ${idField} = ?`,
                [resourceId]
            );

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Resource not found' });
            }

            if (rows[0].owner_id !== req.user.user_id) {
                return res.status(403).json({
                    message: 'Forbidden: You do not own this resource'
                });
            }

            // Store the resource in request for potential use in route handler
            req.resource = rows[0];
            next();
        } catch (err) {
            console.error('Ownership check error:', err);
            next(err);
        }
    };
}

/**
 * Middleware to verify conversation participation
 * @param {string} conversationIdParam - Parameter name containing conversation ID (default: 'id')
 * @returns {Function} Express middleware function
 */
function requireConversationParticipant(conversationIdParam = 'id') {
    return async (req, res, next) => {
        try {
            const conversationId = req.params[conversationIdParam];

            if (!conversationId) {
                return res.status(400).json({ message: `Missing parameter: ${conversationIdParam}` });
            }

            // Check if user is a participant
            const [participant] = await pool.query(
                'SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
                [conversationId, req.user.user_id]
            );

            if (participant.length === 0) {
                return res.status(403).json({ message: 'Forbidden: Not a conversation participant' });
            }

            next();
        } catch (err) {
            console.error('Conversation participation check error:', err);
            next(err);
        }
    };
}

/**
 * Middleware to verify message ownership
 * @returns {Function} Express middleware function
 */
function requireMessageOwnership() {
    return async (req, res, next) => {
        try {
            const messageId = req.params.id;

            if (!messageId) {
                return res.status(400).json({ message: 'Missing message ID' });
            }

            const [message] = await pool.query(
                'SELECT sender_id, created_at FROM messages WHERE message_id = ?',
                [messageId]
            );

            if (message.length === 0) {
                return res.status(404).json({ message: 'Message not found' });
            }

            // Allow message owner or admin to modify/delete
            if (message[0].sender_id !== req.user.user_id && req.user.role !== 'ADMIN') {
                return res.status(403).json({ message: 'Forbidden: Not your message' });
            }

            // Store message data for potential use
            req.message = message[0];
            next();
        } catch (err) {
            console.error('Message ownership check error:', err);
            next(err);
        }
    };
}

module.exports = {
    requireRole,
    requireOwnership,
    requireConversationParticipant,
    requireMessageOwnership
};
