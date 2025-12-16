-- ============================================
-- CLEAN MIGRATION: Drop and Recreate Messaging Schema
-- ============================================
-- This script drops the old conversation schema and creates the new role-agnostic system

USE real_estate_db;

-- Drop old messaging tables in correct order (FK constraints)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS conversations;
SET FOREIGN_KEY_CHECKS = 1;

-- Create new conversations table (role-agnostic)
CREATE TABLE conversations (
  conversation_id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_property_id (property_id),
  INDEX idx_updated_at (updated_at),
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create conversation_participants junction table
CREATE TABLE conversation_participants (
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

-- Create messages table with edit/delete support
CREATE TABLE messages (
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

-- Create favorites table (if not exists)
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

-- Create visits table
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

SELECT '✅ Messaging schema recreated successfully!' as Status;
