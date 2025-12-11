-- Seed agents table with all existing sellers
-- This creates agent records for all users with user_type = 'seller'

INSERT INTO agents (user_id, license_number, bio)
SELECT 
    u.user_id,
    CONCAT('LIC-', LPAD(u.user_id, 6, '0')) as license_number,
    CONCAT('Experienced real estate professional') as bio
FROM users u
WHERE u.user_type = 'seller'
  AND NOT EXISTS (
    SELECT 1 FROM agents a WHERE a.user_id = u.user_id
  );

-- Verify the seed
SELECT 
    a.agent_id,
    u.first_name,
    u.last_name,
    u.email,
    a.license_number
FROM agents a
JOIN users u ON a.user_id = u.user_id
ORDER BY u.first_name;
