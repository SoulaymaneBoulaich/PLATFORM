-- Create property_reviews table for storing property reviews
CREATE TABLE IF NOT EXISTS property_reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  user_id INT NULL,
  rating INT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_property_reviews_property (property_id),
  INDEX idx_property_reviews_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
