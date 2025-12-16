-- Add media columns to messages table
ALTER TABLE messages
ADD COLUMN media_url VARCHAR(2048) NULL,
ADD COLUMN media_type ENUM('TEXT', 'AUDIO', 'IMAGE', 'VIDEO') DEFAULT 'TEXT';

-- Upgrade character set for emoji support
ALTER TABLE messages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
