-- Create notifications table for seller notifications
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  user_to_notify INT NOT NULL,        -- seller_id who receives the notification
  user_from INT NULL,                  -- buyer_id who triggered it (null for guest)
  property_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,           -- 'contact', 'message', etc.
  message VARCHAR(255),                -- Short summary like "New inquiry for Property X"
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_to_notify) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (user_from) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  INDEX idx_user_to_notify (user_to_notify, is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
