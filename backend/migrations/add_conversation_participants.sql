-- Simple migration: Just add conversation_participants table
-- This allows any role combination to participate in conversations

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate existing conversations to participants
-- For each existing conversation, add buyer and seller as participants
INSERT IGNORE INTO conversation_participants (conversation_id, user_id)
SELECT conversation_id, buyer_id 
FROM conversations 
WHERE buyer_id IS NOT NULL
UNION ALL
SELECT conversation_id, seller_id 
FROM conversations 
WHERE seller_id IS NOT NULL;
