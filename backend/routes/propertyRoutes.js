// backend/routes/propertyRoutes.js
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');

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
    let sql = `SELECT * FROM properties WHERE status = 'active'`;

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
      'SELECT * FROM properties WHERE property_id = ?',
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
      has_garden
    } = req.body;

    // Map to final values expected by DB
    const finalAddressLine1 = address_line1 || address;
    const finalAreaSqft = area_sqft || area || null;
    const finalState = state || '';        // or a default
    const finalZip = zip_code || '';
    const finalCountry = country || 'Morocco';  // choose your default

    if (!finalAddressLine1) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const [result] = await pool.query(
      `INSERT INTO properties (
        seller_id, agent_id, title, description, property_type, listing_type, price,
        address_line1, address_line2, city, state, zip_code, country,
        bedrooms, bathrooms, area_sqft, status, listing_date
      ) VALUES (NULLIF(?,0), NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', CURDATE())`,
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
        has_garage || false,  // default to false if not provided
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
      has_garden
    } = req.body;

    const [result] = await pool.query(
      `UPDATE properties 
       SET title=?, description=?, price=?, status=?, updated_at=NOW()
       WHERE property_id=? AND seller_id=?`,
      [title, description, price, status, id, seller_id]
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
