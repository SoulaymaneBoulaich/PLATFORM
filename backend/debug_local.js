const mysql = require('mysql2/promise');

async function checkLocalDb(password) {
    console.log(`Trying localhost with password: '${password}'...`);
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: password,
            database: 'real_estate_db', // Assuming this is the local db name from init.sql
            port: 3306
        });
        console.log('Connected successfully to LOCALHOST!');

        const [rows] = await connection.execute('SELECT user_id, email, first_name FROM users ORDER BY user_id DESC LIMIT 5');
        console.log('Recent Users found in LOCAL DB:', rows);

        await connection.end();
        return true;
    } catch (err) {
        console.log(`Failed with password '${password}': ${err.code}`);
        return false;
    }
}

async function run() {
    // Try empty password
    if (await checkLocalDb('')) return;
    // Try 'root' password
    if (await checkLocalDb('root')) return;
    // Try 'password' password
    if (await checkLocalDb('password')) return;

    console.log('Could not connect to local DB with common passwords.');
}

run();
