// backend/routes/propertyRoutes.js
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const { getCountryFromCity } = require('../utils/cityToCountry');

const router = express.Router();

// GET /api/properties  (public: buyers & sellers)
router.get('/', async (req, res, next) => {
  try {
    const {
      city,
      property_type,
      listing_type,
      minPrice,
      maxPrice,
      minBedrooms,
      minBathrooms,
    } = req.query;

    const params = [];
    let sql = `SELECT property_id, seller_id, title, description, property_type, listing_type, 
                      price, address_line1 as address, city, bedrooms, bathrooms, 
                      area_sqft as area, status, image_url,
                      has_garage, has_pool, has_garden
               FROM properties WHERE status = 'active'`;

    if (city) {
      sql += ' AND city = ?';
      params.push(city);
    }
    if (property_type) {
      sql += ' AND property_type = ?';
      params.push(property_type);
    }
    if (listing_type) {
      sql += ' AND listing_type = ?';
      params.push(listing_type);
    }
    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(maxPrice);
    }
    if (minBedrooms) {
      sql += ' AND bedrooms >= ?';
      params.push(minBedrooms);
    }
    if (minBathrooms) {
      sql += ' AND bathrooms >= ?';
      params.push(minBathrooms);
    }

    sql += ' ORDER BY listing_date DESC LIMIT 100';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/properties/:id  (public)
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const [props] = await pool.query(
      `SELECT 
        p.property_id, p.seller_id, p.agent_id, p.title, p.description, p.property_type, p.listing_type,
        p.price, p.address_line1 as address, p.address_line2, p.city, p.state, p.zip_code, p.country,
        p.bedrooms, p.bathrooms, p.area_sqft as area, p.image_url, p.status, p.listing_date,
        p.created_at, p.updated_at, p.has_garage, p.has_pool, p.has_garden,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.phone as owner_phone
       FROM properties p
       LEFT JOIN users u ON p.seller_id = u.user_id
       WHERE p.property_id = ?`,
      [id]
    );
    if (!props.length) return res.status(404).json({ message: 'Not found' });

    const [images] = await pool.query(
      'SELECT image_id, property_id, image_url, is_primary FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, image_id ASC',
      [id]
    );
    res.json({ ...props[0], images });
  } catch (err) {
    next(err);
  }
});

// POST /api/properties  (only sellers/admin)
router.post('/', auth, async (req, res, next) => {
  try {
    // Must be seller or admin to create properties
    if (req.user.user_type !== 'seller' && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Only sellers can create properties' });
    }

    const seller_id = req.user.user_id;

    // Accept both frontend names and DB names
    const {
      title,
      description,
      property_type,
      listing_type,
      price,
      address_line1,
      address,          // frontend sends this
      city,
      state,
      zip_code,
      country,
      bedrooms,
      bathrooms,
      area_sqft,
      area,             // frontend sends this
      has_garage,       // new feature fields
      has_pool,
      has_garden,
      image_url         // image URL field
    } = req.body;

    // Map to final values expected by DB
    const finalAddressLine1 = address_line1 || address;
    const finalAreaSqft = area_sqft || area || null;
    const finalState = state || '';        // or a default
    const finalZip = zip_code || '';
    const finalCountry = country || getCountryFromCity(city);  // auto-fill from city

    if (!finalAddressLine1) {
      return res.status(400).json({ message: 'Address is required' });
    }

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
        '',                   // address_line2
        city,
        finalState,
        finalZip,
        finalCountry,
        bedrooms,
        bathrooms,
        finalAreaSqft,
        image_url || null,    // image URL
        has_garage || false, // property features
        has_pool || false,
        has_garden || false
      ]
    );

    res.status(201).json({ property_id: result.insertId });
  } catch (err) {
    next(err);
  }
});


// PUT /api/properties/:id  (only seller who owns it or admin)
router.put('/:id', auth, async (req, res, next) => {
  try {
    if (req.user.user_type !== 'seller' && req.user.user_type !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Only sellers can update properties' });
    }

    const id = req.params.id;
    const seller_id = req.user.user_id;
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
    } = req.body;

    const [result] = await pool.query(
      `UPDATE properties 
       SET title=?, description=?, price=?, status=COALESCE(?, status), image_url=?, 
           property_type=?, listing_type=?, bedrooms=?, bathrooms=?, area_sqft=?,
           has_garage=?, has_pool=?, has_garden=?, updated_at=NOW()
       WHERE property_id=? AND seller_id=?`,
      [title, description, price, status, image_url,
        property_type, listing_type, bedrooms, bathrooms, area,
        has_garage, has_pool, has_garden,
        id, seller_id]
    );

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ message: 'Property not found or not owner' });
    }

    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/properties/:id  (only seller who owns it or admin)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (req.user.user_type !== 'seller' && req.user.user_type !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Only sellers can delete properties' });
    }

    const id = req.params.id;
    const seller_id = req.user.user_id;

    const [result] = await pool.query(
      'DELETE FROM properties WHERE property_id = ? AND seller_id = ?',
      [id, seller_id]
    );

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ message: 'Property not found or not owner' });
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
