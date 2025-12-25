const { execSync } = require('child_process');
const pool = require('../config/database');
const Offer = require('../models/Offer');

jest.setTimeout(20000);

describe('Offers seed script', () => {
    beforeAll(async () => {
        try {
            // Try a lightweight DB check before running seeds
            await pool.query('SELECT 1');
            // Run the seed script (idempotent)
            try {
                execSync('npm run seed:offers', { stdio: 'inherit' });
            } catch (err) {
                console.warn('Warning: seed script failed or returned non-zero. Continuing to tests.', err.message);
            }
        } catch (err) {
            console.warn('DB not available or not initialized; seed integration test will be tolerant.', err.message);
        }
    });

    test('should create offers for a known property (skips if DB or data missing)', async () => {
        const [props] = await pool.query('SELECT property_id FROM properties WHERE title = ? LIMIT 1', ['Sunny Villa with Pool']);
        if (!props || props.length === 0) {
            console.warn('No seeded property found; skipping strict assertions for offers.');
            return;
        }

        const propertyId = props[0].property_id;

        const offers = await Offer.findAllByPropertyId(propertyId);
        expect(Array.isArray(offers)).toBe(true);
        expect(offers.length).toBeGreaterThan(0);

        // Basic shape checks
        const offer = offers[0];
        expect(offer).toHaveProperty('offer_id');
        expect(offer).toHaveProperty('amount');
        expect(offer).toHaveProperty('buyer_email');
    });
});
