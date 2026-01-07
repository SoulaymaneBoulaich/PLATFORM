const pool = require('./config/database');

async function checkSchema() {
    try {
        const [rows] = await pool.query('DESCRIBE transactions');
        console.log(rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
