-- Create contact_messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  message_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NULL,
  seller_id INT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL,
  FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_contact_property (property_id),
  INDEX idx_contact_seller (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
