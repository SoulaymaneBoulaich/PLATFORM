-- Migration: Update conversations to support all roles (not just buyer-seller)
-- Add conversation_participants table for flexible multi-role messaging

-- 1. Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  participant_id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_participant (conversation_id, user_id),
  INDEX idx_user (user_id),
  INDEX idx_conversation (conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
  COMMENT='Participants in conversations - supports all roles';

-- 2. Migrate existing conversations to participants
--    For each existing conversation (buyer_id, seller_id), create 2 participants
INSERT IGNORE INTO conversation_participants (conversation_id, user_id)
SELECT conversation_id, buyer_id FROM conversations WHERE buyer_id IS NOT NULL
UNION ALL
SELECT conversation_id, seller_id FROM conversations WHERE seller_id IS NOT NULL;

-- 3. Add updated_at column to conversations if not exists
ALTER TABLE conversations 
  ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER last_message_at;

--4. Add is_read column to messages if not exists  
ALTER TABLE messages 
  ADD COLUMN is_read BOOLEAN DEFAULT FALSE AFTER content;

-- 5. Add indexes for performance (drop first if exists to avoid errors)
ALTER TABLE messages DROP INDEX IF EXISTS idx_read;
ALTER TABLE messages ADD INDEX idx_read (is_read);

ALTER TABLE conversations DROP INDEX IF EXISTS idx_updated;
ALTER TABLE conversations ADD INDEX idx_updated (updated_at);

