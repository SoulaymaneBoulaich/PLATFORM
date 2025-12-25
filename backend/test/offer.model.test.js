const Offer = require('../models/Offer');
const pool = require('../config/database');

jest.mock('../config/database');

describe('Offer model', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('create returns offer object and notifies seller', async () => {
        // Mock select property
        pool.query.mockImplementationOnce(async (sql, params) => {
            // First call: SELECT seller_id, title FROM properties WHERE property_id = ?
            return [[{ seller_id: 11, title: 'Test Property' }], []];
        });

        // Mock insert into offers
        pool.query.mockImplementationOnce(async (sql, params) => {
            return [{ insertId: 42 }, undefined];
        });

        // Mock notification insert (Notification.create uses pool.query as well)
        pool.query.mockImplementationOnce(async (sql, params) => {
            return [{ insertId: 99 }, undefined];
        });

        const result = await Offer.create(5, 9, 250000, 'A string message');

        expect(result.offer_id).toBe(42);
        expect(result.property_id).toBe(5);
        expect(result.seller_id).toBe(11);
        expect(result.amount).toBe(250000);
    });

    test('findAllByPropertyId returns rows', async () => {
        pool.query.mockResolvedValue([[{ offer_id: 1, amount: 1000 }]]);
        const rows = await Offer.findAllByPropertyId(3);
        expect(rows).toEqual([{ offer_id: 1, amount: 1000 }]);
        expect(pool.query).toHaveBeenCalled();
    });
});