-- Create transactions table for tracking payments
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  seller_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type ENUM('payment', 'commission', 'deposit', 'other') NOT NULL DEFAULT 'payment',
  status ENUM('pending', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Add index for faster queries
CREATE INDEX idx_property_id ON transactions(property_id);
CREATE INDEX idx_seller_id ON transactions(seller_id);
CREATE INDEX idx_status ON transactions(status);
