-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id INT,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    last_message TEXT,
    last_message_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_conversation (property_id, buyer_id, seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update messages table to use conversation_id
ALTER TABLE messages 
    ADD COLUMN conversation_id INT AFTER message_id,
    ADD FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE;

-- Migrate existing messages to conversations (if any exist)
-- This is a placeholder - in production you'd want to handle existing messages properly
