const pool = require('../config/database');
const { getCountryFromCity } = require('../utils/cityToCountry');
const PropertyImage = require('./PropertyImage');

class Property {
    static async findAll(filters) {
        const {
            city,
            property_type,
            listing_type,
            minPrice,
            maxPrice,
            minBedrooms,

            minBathrooms,
            seller_id,
            limit = 100
        } = filters;

        const params = [];
        let sql = `SELECT p.property_id, p.seller_id, p.title, p.description, p.property_type, p.listing_type, 
                          p.price, p.address_line1 as address, p.city, p.bedrooms, p.bathrooms, 
                          p.area_sqft as area, p.status, p.image_url,
                          p.has_garage, p.has_pool, p.has_garden,
                          GROUP_CONCAT(pi.image_url ORDER BY pi.is_primary DESC SEPARATOR ',') as all_images
                   FROM properties p
                   LEFT JOIN property_images pi ON p.property_id = pi.property_id
                   WHERE p.status = 'active'`;
        if (seller_id) {
            sql += ' AND p.seller_id = ?';
            params.push(seller_id);
        }

        if (city) {
            sql += ' AND p.city = ?';
            params.push(city);
        }
        if (property_type) {
            sql += ' AND p.property_type = ?';
            params.push(property_type);
        }
        if (listing_type) {
            sql += ' AND p.listing_type = ?';
            params.push(listing_type);
        }
        if (minPrice) {
            sql += ' AND p.price >= ?';
            params.push(minPrice);
        }
        if (maxPrice) {
            sql += ' AND p.price <= ?';
            params.push(maxPrice);
        }
        if (minBedrooms) {
            sql += ' AND p.bedrooms >= ?';
            params.push(minBedrooms);
        }
        if (minBathrooms) {
            sql += ' AND p.bathrooms >= ?';
            params.push(minBathrooms);
        }

        sql += ' GROUP BY p.property_id ORDER BY p.listing_date DESC LIMIT ?';
        params.push(Number(limit));

        const [rows] = await pool.query(sql, params);

        return rows.map(row => ({
            ...row,
            images: row.all_images ? row.all_images.split(',') : [row.image_url]
        }));
    }

    static async findById(id) {
        const [props] = await pool.query(
            `SELECT 
        p.property_id, p.seller_id, p.agent_id, p.title, p.description, p.property_type, p.listing_type,
        p.price, p.address_line1 as address, p.address_line2, p.city, p.state, p.zip_code, p.country,
        p.bedrooms, p.bathrooms, p.area_sqft as area, p.image_url, p.status, p.listing_date,
        p.created_at, p.updated_at, p.has_garage, p.has_pool, p.has_garden,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.phone as owner_phone,
        u.profile_image as owner_image
       FROM properties p
       LEFT JOIN users u ON p.seller_id = u.user_id
       WHERE p.property_id = ?`,
            [id]
        );

        if (!props.length) return null;

        const images = await PropertyImage.findAllByPropertyId(id);

        return { ...props[0], images };
    }

    static async create(data) {
        const {
            seller_id,
            title,
            description,
            property_type,
            listing_type,
            price,
            address_line1,
            address,
            city,
            state,
            zip_code,
            country,
            bedrooms,
            bathrooms,
            area_sqft,
            area,
            has_garage,
            has_pool,
            has_garden,
            image_url
        } = data;

        const finalAddressLine1 = address_line1 || address;
        const finalAreaSqft = area_sqft || area || null;
        const finalState = state || '';
        const finalZip = zip_code || '';
        const finalCountry = country || getCountryFromCity(city);

        const [result] = await pool.query(
            `INSERT INTO properties (
        seller_id, agent_id, title, description, property_type, listing_type, price,
        address_line1, address_line2, city, state, zip_code, country,
        bedrooms, bathrooms, area_sqft, image_url, status, listing_date,
        has_garage, has_pool, has_garden
      ) VALUES (NULLIF(?,0), NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURDATE(), ?, ?, ?)`,
            [
                seller_id,
                title,
                description || '',
                property_type,
                listing_type,
                price,
                finalAddressLine1,
                '',
                city,
                finalState,
                finalZip,
                finalCountry,
                bedrooms,
                bathrooms,
                finalAreaSqft,
                image_url || null,
                has_garage || false,
                has_pool || false,
                has_garden || false
            ]
        );

        return result.insertId;
    }

    static async update(id, sellerId, data) {
        const {
            title,
            description,
            price,
            status,
            property_type,
            listing_type,
            bedrooms,
            bathrooms,
            area,
            has_garage,
            has_pool,
            has_garden,
            image_url
        } = data;

        const [result] = await pool.query(
            `UPDATE properties 
       SET title=?, description=?, price=?, status=COALESCE(?, status), image_url=?, 
           property_type=?, listing_type=?, bedrooms=?, bathrooms=?, area_sqft=?,
           has_garage=?, has_pool=?, has_garden=?, updated_at=NOW()
       WHERE property_id=? AND seller_id=?`,
            [title, description, price, status, image_url,
                property_type, listing_type, bedrooms, bathrooms, area,
                has_garage, has_pool, has_garden,
                id, sellerId]
        );

        return result.affectedRows > 0;
    }

    static async delete(id, sellerId) {
        const [result] = await pool.query(
            'DELETE FROM properties WHERE property_id = ? AND seller_id = ?',
            [id, sellerId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Property;
