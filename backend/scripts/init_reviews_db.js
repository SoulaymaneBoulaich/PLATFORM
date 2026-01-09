const pool = require('./config/database');

const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_reviews (
                review_id INT AUTO_INCREMENT PRIMARY KEY,
                agent_id INT NOT NULL,
                reviewer_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (agent_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
                UNIQUE KEY unique_review (agent_id, reviewer_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('user_reviews table created or already exists.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to create table:', err);
        process.exit(1);
    }
};

createTable();
