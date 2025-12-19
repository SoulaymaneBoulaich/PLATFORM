-- Complete cleanup script (fixes foreign key constraint issues)

USE real_estate_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Remove all seeded users (IDs 36-45 from the presentation seed)
DELETE FROM users WHERE user_id BETWEEN 36 AND 45;

-- Remove any agents for these users
DELETE FROM agents WHERE user_id BETWEEN 36 AND 45;

-- Remove any properties owned by these users
DELETE FROM properties WHERE seller_id BETWEEN 36 AND 45;

-- Remove any appointments for these users
DELETE FROM appointments WHERE user_id BETWEEN 36 AND 45;

-- Remove any reviews by these users
DELETE FROM property_reviews WHERE user_id BETWEEN 36 AND 45;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Seeded data completely removed' as status;
