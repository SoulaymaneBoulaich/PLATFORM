const User = require('../models/User');

exports.deleteUser = async (req, res, next) => {
    try {
        // Allow admin to delete any user
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({ message: 'Only admins can delete users' });
        }

        const userId = req.params.id;
        // Optionally prevent deleting self
        if (parseInt(userId) === req.user.user_id) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        // Cascade delete related records
        const connection = await require('../config/database').getConnection();
        try {
            await connection.beginTransaction();

            // Delete transactions where user is seller or buyer/participant? 
            // Transactions usually have seller_id. 
            // Buyer is not explicitly in transaction table? Check schema.. (id, property_id, seller_id, amount, type, status)
            // Wait, we need to be careful. If we delete a SELLER, we delete their properties and transactions?

            // 1. Delete Messages
            await connection.query('DELETE FROM messages WHERE sender_id = ?', [userId]);

            // 2. Delete Conversations (tricky, involves participants)
            // Simplified: Delete participation
            await connection.query('DELETE FROM conversation_participants WHERE user_id = ?', [userId]);

            // 3. Delete Properties (and their images, etc??) - This is heavy.
            // Let's first delete properties owned by this user
            const [properties] = await connection.query('SELECT property_id FROM properties WHERE seller_id = ?', [userId]);
            for (const prop of properties) {
                // Delete property images
                await connection.query('DELETE FROM property_images WHERE property_id = ?', [prop.property_id]);
                // Delete transactions for this property
                await connection.query('DELETE FROM transactions WHERE property_id = ?', [prop.property_id]);
                // Delete favorites
                await connection.query('DELETE FROM favorites WHERE property_id = ?', [prop.property_id]);
                // Delete appointments
                // await connection.query('DELETE FROM appointments WHERE property_id = ?', [prop.property_id]); 
            }
            await connection.query('DELETE FROM properties WHERE seller_id = ?', [userId]);

            // 4. Finally delete user
            await connection.query('DELETE FROM users WHERE user_id = ?', [userId]);

            await connection.commit();
        } catch (dbErr) {
            await connection.rollback();
            throw dbErr;
        } finally {
            connection.release();
        }

        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (err) {
        next(err);
    }
};
