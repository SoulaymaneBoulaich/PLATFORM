const Transaction = require('./models/Transaction');
const pool = require('./config/database');

async function testCreate() {
    try {
        console.log('Testing transaction creation...');
        // We need valid property_id and seller_id.
        // Let's fetch one first.
        const [props] = await pool.query('SELECT property_id, seller_id FROM properties LIMIT 1');
        if (props.length === 0) {
            console.log('No properties found to test with.');
            process.exit(0);
        }
        const p = props[0];
        console.log('Using property:', p);

        const data = {
            property_id: p.property_id,
            seller_id: p.seller_id,
            amount: 100.50,
            type: 'payment',
            status: 'pending'
        };

        const id = await Transaction.create(data);
        console.log('Success! Created transaction ID:', id);

        // Clean up
        await Transaction.delete(id);
        console.log('Cleaned up.');

    } catch (err) {
        console.error('ERROR creating transaction:', err);
    } finally {
        process.exit();
    }
}

testCreate();
