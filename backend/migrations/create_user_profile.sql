-- Add profile columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS bio TEXT NULL,
ADD COLUMN IF NOT EXISTS location VARCHAR(150) NULL;

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    email_notifications TINYINT(1) DEFAULT 1,
    sms_notifications TINYINT(1) DEFAULT 0,
    dark_mode TINYINT(1) DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
