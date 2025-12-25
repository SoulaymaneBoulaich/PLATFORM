const offerController = require('../controllers/offerController');
const Offer = require('../models/Offer');

jest.mock('../models/Offer');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe('Offer Controller', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        mockNext.mockReset();
    });

    test('createOffer returns 201 on success', async () => {
        Offer.create.mockResolvedValue({ offer_id: 1, property_id: 2, amount: 1000, status: 'Pending' });

        const req = { params: { propertyId: '2' }, body: { amount: 1000, message: 'Hi' }, user: { user_id: 5 } };
        const res = mockRes();

        await offerController.createOffer(req, res, mockNext);

        expect(Offer.create).toHaveBeenCalledWith('2', 5, 1000, 'Hi');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ offer_id: 1 }));
    });

    test('createOffer returns 400 with invalid amount', async () => {
        const req = { params: {}, body: { amount: 0 }, user: { user_id: 5 } };
        const res = mockRes();

        await offerController.createOffer(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Valid propertyId and amount are required' });
    });

    test('updateOfferStatus returns 400 for invalid status', async () => {
        const req = { params: { id: '10' }, body: { status: 'INVALID' }, user: { user_id: 3 } };
        const res = mockRes();

        await offerController.updateOfferStatus(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid status' });
    });

    test('updateOfferStatus handles unauthorized', async () => {
        Offer.updateStatus.mockResolvedValue({ error: 'Unauthorized' });
        const req = { params: { id: '10' }, body: { status: 'Accepted' }, user: { user_id: 3 } };
        const res = mockRes();

        await offerController.updateOfferStatus(req, res, mockNext);

        expect(Offer.updateStatus).toHaveBeenCalledWith('10', 'Accepted', undefined, undefined, 3);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Only the seller can update offers' });
    });

    test('getSellerOffers returns offers', async () => {
        Offer.findAllBySellerId.mockResolvedValue([{ offer_id: 1 }]);
        const req = { user: { user_id: 7 } };
        const res = mockRes();

        await offerController.getSellerOffers(req, res, mockNext);

        expect(Offer.findAllBySellerId).toHaveBeenCalledWith(7);
        expect(res.json).toHaveBeenCalledWith({ offers: [{ offer_id: 1 }] });
    });

    test('getBuyerOffers returns offers', async () => {
        Offer.findAllByBuyerId.mockResolvedValue([{ offer_id: 2 }]);
        const req = { user: { user_id: 9 } };
        const res = mockRes();

        await offerController.getBuyerOffers(req, res, mockNext);

        expect(Offer.findAllByBuyerId).toHaveBeenCalledWith(9);
        expect(res.json).toHaveBeenCalledWith({ offers: [{ offer_id: 2 }] });
    });
});