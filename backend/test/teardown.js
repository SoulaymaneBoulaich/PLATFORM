// Global teardown to close DB pool and give Jest clean exit
const pool = require('../config/database');

afterAll(async () => {
  if (pool && typeof pool.end === 'function') {
    try {
      await pool.end();
      // console.log('Database pool closed by test teardown');
    } catch (err) {
      // ignore
    }
  }
});
