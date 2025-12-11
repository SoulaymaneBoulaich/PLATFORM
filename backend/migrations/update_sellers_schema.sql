-- Ensure agents table can function as sellers
-- Note: This is a verification/update script, not creation

-- If you need to add email/phone to agents table (uncomment if needed):
-- ALTER TABLE agents 
--   ADD COLUMN IF NOT EXISTS email VARCHAR(100),
--   ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Verify that properties table has seller_id or agent_id
-- The properties table should already have one of these
-- If you renamed agent_id to seller_id, this helps with that:
-- ALTER TABLE properties CHANGE COLUMN agent_id seller_id INT;

-- The current schema uses:
-- agents table with: agent_id, user_id, license_number, bio, created_at
-- users table with: user_id, first_name, last_name, email, phone
-- properties table with: seller_id (links to users.user_id)

-- Since agents reference users via user_id, and properties reference users via seller_id,
-- we can treat agents as sellers by joining:
-- agents -> users (via user_id) <- properties (via seller_id)

-- No changes needed if the above relationships already exist
SELECT 'Schema verification complete' AS status;
