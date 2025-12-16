-- ============================================
-- Role-Based System Migration
-- ============================================
-- This migration adds comprehensive role-based features including:
-- 1. Enhanced user roles (BUYER, SELLER, AGENT, ADMIN)
-- 2. Messaging system with edit/delete support
-- 3. Favorites and visits tables
-- 4. Property ownership updates

USE real_estate_db;

-- ============================================
-- PART 1: UPDATE USERS TABLE
-- ============================================

-- Alter user_type enum to include new roles
ALTER TABLE users 
MODIFY COLUMN user_type ENUM('buyer','seller','agent','admin','BUYER','SELLER','AGENT','ADMIN') NOT NULL DEFAULT 'BUYER';

-- Add agency_name if not exists (for backward compatibility with existing schema)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255) AFTER phone;

-- Normalize existing data to uppercase role names
UPDATE users SET user_type = 'BUYER' WHERE user_type = 'buyer';
UPDATE users SET user_type = 'SELLER' WHERE user_type = 'seller';
UPDATE users SET user_type = 'ADMIN' WHERE user_type = 'admin';

-- Now remove lowercase options
ALTER TABLE users 
MODIFY COLUMN user_type ENUM('BUYER','SELLER','AGENT','ADMIN') NOT NULL DEFAULT 'BUYER';

-- ============================================
-- PART 2: UPDATE PROPERTIES TABLE
-- ============================================

-- Rename seller_id to owner_id for clarity
ALTER TABLE properties 
CHANGE COLUMN seller_id owner_id INT(11) NOT NULL;

-- Update foreign key constraint name
-- Note: constraint names may vary, adjust if needed
ALTER TABLE properties 
DROP FOREIGN KEY IF EXISTS properties_ibfk_1;

ALTER TABLE properties 
ADD CONSTRAINT fk_properties_owner 
FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE RESTRICT;

-- ============================================
-- PART 3: CREATE MESSAGING TABLES
-- ============================================

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  conversation_id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_property_id (property_id),
  INDEX idx_updated_at (updated_at),
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_conv_user (conversation_id, user_id),
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table with edit/delete support
CREATE TABLE IF NOT EXISTS messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  is_edited TINYINT(1) NOT NULL DEFAULT 0,
  deleted_at DATETIME NULL,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PART 4: CREATE FAVORITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
  favorite_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  property_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_favorite (user_id, property_id),
  INDEX idx_user_id (user_id),
  INDEX idx_property_id (property_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PART 5: CREATE VISITS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS visits (
  visit_id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  property_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  status ENUM('PENDING','CONFIRMED','CANCELLED') DEFAULT 'PENDING',
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_buyer_id (buyer_id),
  INDEX idx_property_id (property_id),
  INDEX idx_scheduled_at (scheduled_at),
  INDEX idx_status (status),
  FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify users table structure
SELECT 'Users table structure:' as Info;
DESCRIBE users;

-- Verify new tables exist
SELECT 'New tables created:' as Info;
SHOW TABLES LIKE 'conversations';
SHOW TABLES LIKE 'conversation_participants';
SHOW TABLES LIKE 'messages';
SHOW TABLES LIKE 'favorites';
SHOW TABLES LIKE 'visits';

-- Verify properties table update
SELECT 'Properties table structure:' as Info;
DESCRIBE properties;

-- Count existing data
SELECT 
  'Existing data summary:' as Info,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM properties) as total_properties,
  (SELECT COUNT(*) FROM conversations) as total_conversations,
  (SELECT COUNT(*) FROM messages) as total_messages,
  (SELECT COUNT(*) FROM favorites) as total_favorites,
  (SELECT COUNT(*) FROM visits) as total_visits;

SELECT '✅ Migration completed successfully!' as Status;
