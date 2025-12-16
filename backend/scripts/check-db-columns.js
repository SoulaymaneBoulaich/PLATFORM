const pool = require('../config/database');
const path = require('path');

async function checkColumns() {
    console.log('Checking properties table columns...');

    try {
        const [rows] = await pool.query('DESCRIBE properties');
        console.log('Columns:');
        rows.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });

        // Check specifically for seller_id or agent_id
        const hasSellerId = rows.some(r => r.Field === 'seller_id');
        const hasAgentId = rows.some(r => r.Field === 'agent_id');
        const hasUserId = rows.some(r => r.Field === 'user_id');

        console.log('\nKeys found:');
        if (hasSellerId) console.log('✅ seller_id exists');
        if (hasAgentId) console.log('✅ agent_id exists');
        if (hasUserId) console.log('✅ user_id exists');

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
    }
}

checkColumns();
