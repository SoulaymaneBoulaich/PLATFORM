const pool = require('../config/database');

class Conversation {
    static async start(userId, targetUserId, propertyId = null) {
        // Check if target user exists
        const [targetUser] = await pool.query(
            'SELECT user_id FROM users WHERE user_id = ?',
            [targetUserId]
        );

        if (targetUser.length === 0) return { error: 'Target user not found' };

        // Check if conversation already exists
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
            return {
                conversation_id: existing[0].conversation_id,
                created: false
            };
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

        return {
            conversation_id: conversationId,
            created: true
        };
    }

    static async findAllByUserId(userId) {
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
        `, [userId, userId]);

        return conversations;
    }

    static async findById(id) {
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
        `, [id]);

        return conversation[0] || null;
    }

    static async updateTimestamp(conversationId) {
        await pool.query(
            'UPDATE conversations SET updated_at = NOW() WHERE conversation_id = ?',
            [conversationId]
        );
    }
}

module.exports = Conversation;
