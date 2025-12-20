const Conversation = require('./models/Conversation');
const pool = require('./config/database');
const dotenv = require('dotenv');

dotenv.config();

async function testQuery() {
    try {
        console.log('Testing Conversation.findAllByUserId...');
        // We need a valid user ID. I'll guess 1 or try to find one.
        // Or I can just run the query with a dummy ID 99999 to see if it syntax-errors.
        const userId = undefined;
        const results = await Conversation.findAllByUserId(userId);
        console.log('Query successful. Results:', results);
    } catch (err) {
        console.error('Query failed!', err);
    } finally {
        process.exit();
    }
}

testQuery();
