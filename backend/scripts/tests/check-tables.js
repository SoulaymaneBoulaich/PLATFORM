require('dotenv').config();
const pool = require('../../config/database');

async function checkTables() {
    try {
        const [tables] = await pool.query("SHOW TABLES LIKE '%conversation%'");
        console.log('✅ Found tables:', tables);

        const [messages] = await pool.query("SHOW TABLES LIKE 'messages'");
        console.log('✅ Messages table exists:', messages.length > 0);

        const [favorites] = await pool.query("SHOW TABLES LIKE 'favorites'");
        console.log('✅ Favorites table exists:', favorites.length > 0);

        const [visits] = await pool.query("SHOW TABLES LIKE 'visits'");
        console.log('✅ Visits table exists:', visits.length > 0);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

checkTables();
