const pool = require('../config/database');

class PropertyImage {
    static async findAllByPropertyId(propertyId) {
        const [rows] = await pool.query(
            'SELECT image_id, property_id, image_url, is_primary FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, image_id ASC',
            [propertyId]
        );
        return rows;
    }

    static async create(propertyId, imageUrl, isPrimary = false) {
        const [result] = await pool.query(
            'INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)',
            [propertyId, imageUrl, isPrimary]
        );
        return result.insertId;
    }

    static async delete(imageId) {
        const [result] = await pool.query(
            'DELETE FROM property_images WHERE image_id = ?',
            [imageId]
        );
        return result.affectedRows > 0;
    }

    static async setPrimary(imageId, propertyId) {
        // First, unset primary for all images of this property
        await pool.query(
            'UPDATE property_images SET is_primary = false WHERE property_id = ?',
            [propertyId]
        );

        // Then set the specific image as primary
        const [result] = await pool.query(
            'UPDATE property_images SET is_primary = true WHERE image_id = ?',
            [imageId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = PropertyImage;
