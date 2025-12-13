-- Enhance users table for improved authentication and role management

-- Add agent to user_type enum if not exists
ALTER TABLE users MODIFY COLUMN user_type ENUM('buyer', 'seller', 'agent', 'admin') NOT NULL;

-- Add agency_name for agents and sellers (IF NOT EXISTS only works in MariaDB 10.0.2+)
-- Using safer approach: ignore error if column exists
SET @query1 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'agency_name') = 0,
  'ALTER TABLE users ADD COLUMN agency_name VARCHAR(200) DEFAULT NULL',
  'SELECT "Column agency_name already exists" AS info'
);
PREPARE stmt1 FROM @query1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- Add license_id for agent tracking
SET @query2 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'license_id') = 0,
  'ALTER TABLE users ADD COLUMN license_id VARCHAR(100) DEFAULT NULL',
  'SELECT "Column license_id already exists" AS info'
);
PREPARE stmt2 FROM @query2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Add preferences JSON for user settings and onboarding state
SET @query3 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'preferences') = 0,
  'ALTER TABLE users ADD COLUMN preferences JSON DEFAULT NULL',
  'SELECT "Column preferences already exists" AS info'
);
PREPARE stmt3 FROM @query3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

