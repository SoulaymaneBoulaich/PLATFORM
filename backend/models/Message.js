const pool = require('../config/database');

class Message {
    static async findAllByConversationId(conversationId) {
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
        `, [conversationId]);
        return messages;
    }

    static async create(data) {
        const { conversationId, senderId, content, mediaUrl, mediaType } = data;
        const [result] = await pool.query(
            'INSERT INTO messages (conversation_id, sender_id, content, media_url, media_type) VALUES (?, ?, ?, ?, ?)',
            [conversationId, senderId, content, mediaUrl || null, mediaType || null]
        );
        return result.insertId;
    }

    static async update(messageId, content) {
        await pool.query(
            'UPDATE messages SET content = ?, updated_at = NOW(), is_edited = 1 WHERE message_id = ?',
            [content, messageId]
        );
    }

    static async softDelete(messageId) {
        await pool.query(
            'UPDATE messages SET deleted_at = NOW(), content = "[deleted]" WHERE message_id = ?',
            [messageId]
        );
    }

    static async findById(messageId) {
        const [messages] = await pool.query(
            'SELECT * FROM messages WHERE message_id = ?',
            [messageId]
        );
        return messages[0] || null;
    }
}

module.exports = Message;
