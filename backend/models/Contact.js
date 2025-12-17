const pool = require('../config/database');

class Contact {
    static async create(data) {
        const { propertyId, sellerId, name, email, phone, message } = data;
        await pool.query(
            'INSERT INTO contact_messages (property_id, seller_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?, ?)',
            [propertyId || null, sellerId || null, name, email, phone || null, message]
        );
    }

    static async createNotification(sellerId, buyerId, propertyId, title) {
        await pool.query(
            'INSERT INTO notifications (user_to_notify, user_from, property_id, type, message) VALUES (?, ?, ?, ?, ?)',
            [sellerId, buyerId, propertyId, 'contact', `New inquiry for "${title}"`]
        );
    }
}

module.exports = Contact;
