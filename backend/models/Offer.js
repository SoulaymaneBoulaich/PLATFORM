const pool = require('../config/database');
const Notification = require('./Notification');

class Offer {
    static async create(propertyId, buyerId, amount, message) {
        // Get property info first
        const [property] = await pool.query(
            'SELECT seller_id, title FROM properties WHERE property_id = ?',
            [propertyId]
        );

        if (!property || property.length === 0) {
            return { error: 'Property not found' };
        }

        const sellerId = property[0].seller_id;
        const title = property[0].title;

        const [result] = await pool.query(
            'INSERT INTO offers (property_id, buyer_id, seller_id, amount, message) VALUES (?, ?, ?, ?, ?)',
            [propertyId, buyerId, sellerId, amount, message || null]
        );

        // Notify seller
        await Notification.create(
            sellerId, buyerId, propertyId, 'offer',
            `New offer of $${amount} for "${title}"`
        );

        return {
            offer_id: result.insertId,
            property_id: propertyId,
            seller_id: sellerId,
            amount,
            status: 'Pending',
            created_at: new Date()
        };
    }

    static async findAllByPropertyId(propertyId) {
        const query = `
            SELECT 
                o.*,
                u.first_name as buyer_first_name,
                u.last_name as buyer_last_name,
                u.email as buyer_email
            FROM offers o
            JOIN users u ON o.buyer_id = u.user_id
            WHERE o.property_id = ?
            ORDER BY o.created_at DESC
        `;
        const [rows] = await pool.query(query, [propertyId]);
        return rows;
    }

    static async findAllBySellerId(sellerId) {
        const query = `
            SELECT 
                o.*,
                p.title as property_title,
                p.image_url as property_image,
                u.first_name as buyer_first_name,
                u.last_name as buyer_last_name,
                u.email as buyer_email
            FROM offers o
            JOIN properties p ON o.property_id = p.property_id
            JOIN users u ON o.buyer_id = u.user_id
            WHERE o.seller_id = ?
            ORDER BY o.created_at DESC
        `;
        const [rows] = await pool.query(query, [sellerId]);
        return rows;
    }

    static async findAllByBuyerId(buyerId) {
        const query = `
            SELECT 
                o.*,
                p.title as property_title,
                p.image_url as property_image,
                p.city,
                p.price as property_price,
                u.first_name as seller_first_name,
                u.last_name as seller_last_name
            FROM offers o
            JOIN properties p ON o.property_id = p.property_id
            JOIN users u ON o.seller_id = u.user_id
            WHERE o.buyer_id = ?
            ORDER BY o.created_at DESC
        `;
        const [rows] = await pool.query(query, [buyerId]);
        return rows;
    }

    static async findById(offerId) {
        const [rows] = await pool.query('SELECT * FROM offers WHERE offer_id = ?', [offerId]);
        return rows[0];
    }

    static async updateStatus(offerId, status, counterAmount, message, userId) {
        const offer = await this.findById(offerId);
        if (!offer) return { error: 'Offer not found' };
        if (offer.seller_id !== userId) return { error: 'Unauthorized' };

        const updateAmount = status === 'Countered' && counterAmount ? counterAmount : offer.amount;

        await pool.query(
            'UPDATE offers SET status = ?, amount = ?, message = ? WHERE offer_id = ?',
            [status, updateAmount, message || offer.message, offerId]
        );

        if (status === 'Accepted') {
            await pool.query(
                'UPDATE properties SET property_status = ? WHERE property_id = ?',
                ['Under Offer', offer.property_id]
            );
        }

        const notifMsg = status === 'Accepted'
            ? `Your offer of $${offer.amount} was accepted!`
            : status === 'Rejected'
                ? `Your offer of $${offer.amount} was rejected`
                : `Seller countered with $${updateAmount}`;

        await Notification.create(
            offer.buyer_id, userId, offer.property_id, 'offer_update', notifMsg
        );

        return {
            offer_id: offerId,
            status,
            amount: updateAmount
        };
    }
}

module.exports = Offer;
