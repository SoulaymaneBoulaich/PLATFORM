-- Database Schema Dump

USE real_estate_db;

-- Table: agents
DROP TABLE IF EXISTS `agents`;
CREATE TABLE `agents` (
  `agent_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `agency_name` varchar(200) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_sales` int(11) DEFAULT 0,
  `commission_rate` decimal(5,2) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  PRIMARY KEY (`agent_id`),
  UNIQUE KEY `license_number` (`license_number`),
  KEY `user_id` (`user_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_license` (`license_number`),
  CONSTRAINT `agents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4;

-- Table: appointments
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `appointment_id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `appointment_date` datetime NOT NULL,
  `appointment_type` enum('viewing','consultation','inspection') NOT NULL,
  `status` enum('scheduled','completed','cancelled','no_show') DEFAULT 'scheduled',
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`appointment_id`),
  KEY `property_id` (`property_id`),
  KEY `user_id` (`user_id`),
  KEY `agent_id` (`agent_id`),
  KEY `idx_appointment_date` (`appointment_date`),
  KEY `idx_appointment_status` (`status`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Table: contact_messages
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) DEFAULT NULL,
  `seller_id` int(11) DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`message_id`),
  KEY `idx_contact_property` (`property_id`),
  KEY `idx_contact_seller` (`seller_id`),
  CONSTRAINT `contact_messages_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE SET NULL,
  CONSTRAINT `contact_messages_ibfk_2` FOREIGN KEY (`seller_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: conversations
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `conversation_id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) DEFAULT NULL,
  `buyer_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `last_message` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_message_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`conversation_id`),
  UNIQUE KEY `unique_conversation` (`property_id`,`buyer_id`,`seller_id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `seller_id` (`seller_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `conversations_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: favorites
DROP TABLE IF EXISTS `favorites`;
CREATE TABLE `favorites` (
  `favorite_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `property_id` int(11) NOT NULL,
  `added_date` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`favorite_id`),
  UNIQUE KEY `unique_favorite` (`user_id`,`property_id`),
  KEY `property_id` (`property_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;

-- Table: messages
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` int(11) DEFAULT NULL,
  `sender_id` int(11) NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attachment_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`message_id`),
  KEY `idx_property_users` (`sender_id`),
  KEY `idx_created` (`created_at`),
  KEY `conversation_id` (`conversation_id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_4` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_to_notify` int(11) NOT NULL,
  `user_from` int(11) DEFAULT NULL,
  `property_id` int(11) NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notification_id`),
  KEY `user_from` (`user_from`),
  KEY `property_id` (`property_id`),
  KEY `idx_user_to_notify` (`user_to_notify`,`is_read`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_to_notify`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`user_from`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: offers
DROP TABLE IF EXISTS `offers`;
CREATE TABLE `offers` (
  `offer_id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('Pending','Accepted','Rejected','Countered') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `message` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`offer_id`),
  KEY `idx_property_id` (`property_id`),
  KEY `idx_buyer_id` (`buyer_id`),
  KEY `idx_seller_id` (`seller_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `offers_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE,
  CONSTRAINT `offers_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `offers_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: properties
DROP TABLE IF EXISTS `properties`;
CREATE TABLE `properties` (
  `property_id` int(11) NOT NULL AUTO_INCREMENT,
  `seller_id` int(11) NOT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `property_type` enum('house','apartment','condo','land','commercial') NOT NULL,
  `listing_type` enum('sale','rent') NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `zip_code` varchar(20) NOT NULL,
  `country` varchar(100) DEFAULT 'USA',
  `bedrooms` int(11) DEFAULT NULL,
  `bathrooms` decimal(3,1) DEFAULT NULL,
  `area_sqft` int(11) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `status` enum('active','pending','sold','rented','inactive') DEFAULT 'active',
  `listing_date` date NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `has_garage` tinyint(1) DEFAULT 0,
  `has_pool` tinyint(1) DEFAULT 0,
  `has_garden` tinyint(1) DEFAULT 0,
  `property_status` enum('Available','Under Offer','Sold') DEFAULT 'Available',
  PRIMARY KEY (`property_id`),
  KEY `seller_id` (`seller_id`),
  KEY `agent_id` (`agent_id`),
  KEY `idx_city` (`city`),
  KEY `idx_price` (`price`),
  KEY `idx_property_type` (`property_type`),
  KEY `idx_status` (`status`),
  KEY `idx_listing_date` (`listing_date`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `properties_ibfk_2` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4;

-- Table: property_favorites
DROP TABLE IF EXISTS `property_favorites`;
CREATE TABLE `property_favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorite` (`property_id`,`user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `property_favorites_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE,
  CONSTRAINT `property_favorites_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: property_images
DROP TABLE IF EXISTS `property_images`;
CREATE TABLE `property_images` (
  `image_id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `upload_date` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`image_id`),
  KEY `idx_property` (`property_id`),
  CONSTRAINT `property_images_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;

-- Table: property_reviews
DROP TABLE IF EXISTS `property_reviews`;
CREATE TABLE `property_reviews` (
  `review_id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`review_id`),
  KEY `idx_property_reviews_property` (`property_id`),
  KEY `idx_property_reviews_user` (`user_id`),
  CONSTRAINT `property_reviews_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE,
  CONSTRAINT `property_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: property_views
DROP TABLE IF EXISTS `property_views`;
CREATE TABLE `property_views` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_property_id` (`property_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_viewed_at` (`viewed_at`),
  CONSTRAINT `property_views_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: reviews
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) DEFAULT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `review_text` text DEFAULT NULL,
  `review_date` datetime DEFAULT current_timestamp(),
  `is_verified` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`review_id`),
  KEY `property_id` (`property_id`),
  KEY `agent_id` (`agent_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_review_rating` (`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

-- Table: saved_searches
DROP TABLE IF EXISTS `saved_searches`;
CREATE TABLE `saved_searches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filters_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`filters_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `saved_searches_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: search_history
DROP TABLE IF EXISTS `search_history`;
CREATE TABLE `search_history` (
  `search_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `search_query` varchar(255) DEFAULT NULL,
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filters`)),
  `search_date` datetime DEFAULT current_timestamp(),
  `results_count` int(11) DEFAULT NULL,
  PRIMARY KEY (`search_id`),
  KEY `idx_search_user` (`user_id`),
  KEY `idx_search_date` (`search_date`),
  CONSTRAINT `search_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: transactions
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `transaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `property_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `transaction_type` enum('sale','rental') NOT NULL,
  `transaction_amount` decimal(15,2) NOT NULL,
  `commission_amount` decimal(15,2) DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`transaction_id`),
  KEY `property_id` (`property_id`),
  KEY `buyer_id` (`buyer_id`),
  KEY `seller_id` (`seller_id`),
  KEY `agent_id` (`agent_id`),
  KEY `idx_transaction_date` (`transaction_date`),
  KEY `idx_transaction_status` (`status`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`property_id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `transactions_ibfk_4` FOREIGN KEY (`agent_id`) REFERENCES `agents` (`agent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: user_settings
DROP TABLE IF EXISTS `user_settings`;
CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `sms_notifications` tinyint(1) DEFAULT 0,
  `dark_mode` tinyint(1) DEFAULT 0,
  `language` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'en',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `user_type` enum('buyer','seller','admin') NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `date_registered` datetime DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `profile_image_url` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_user_type` (`user_type`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;

-- SEED DATA 

-- Content from seed_dashboard_data.sql
-- Seed script to create sample data for dashboard testing
-- This creates multiple properties with different types, statuses, and sellers

-- Ensure we have seller users first
-- Insert some test sellers if they don't exist
INSERT INTO users (first_name, last_name, email, password_hash, phone, user_type)
VALUES 
    ('Alice', 'Johnson', 'alice@test.com', '$2a$10$dummyhash1', '555-0001', 'seller'),
    ('Bob', 'Smith', 'bob@test.com', '$2a$10$dummyhash2', '555-0002', 'seller'),
    ('Carol', 'Williams', 'carol@test.com', '$2a$10$dummyhash3', '555-0003', 'seller')
ON DUPLICATE KEY UPDATE user_id=LAST_INSERT_ID(user_id);

-- Get seller IDs (assuming they are the last 3 inserted or existing users)
SET @seller1 = (SELECT user_id FROM users WHERE email = 'alice@test.com');
SET @seller2 = (SELECT user_id FROM users WHERE email = 'bob@test.com');
SET @seller3 = (SELECT user_id FROM users WHERE email = 'carol@test.com');

-- Insert properties with various types and statuses
INSERT INTO properties (seller_id, title, description, property_type, listing_type, price, address_line1, city, state, zip_code, country, bedrooms, bathrooms, area_sqft, status, listing_date, image_url)
VALUES
    -- House properties
    (@seller1, 'Modern Family House', 'Beautifullly 3-bedroom house with garden', 'house', 'Sale', 350000, '123 Oak Street', 'Casablanca', 'Grand Casablanca', '20000', 'Morocco', 3, 2, 1500, 'active', CURDATE(), 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'),
    (@seller1, 'Cozy Suburban Home', 'Perfect starter home', 'house', 'Sale', 280000, '456 Maple Ave', 'Rabat', 'Rabat-Sale', '10000', 'Morocco', 2, 1, 1200, 'sold', CURDATE(), 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'),
    (@seller2, 'Luxury Villa', 'Stunning villa with pool', 'house', 'Sale', 850000, '789 Palm Road', 'Marrakech', 'Marrakech-Safi', '40000', 'Morocco', 5, 4, 3500, 'active', CURDATE(), 'https://images.unsplash.com/photo-1613490493576-7fde63acd811'),
    
    -- Apartment properties
    (@seller2, 'Downtown Apartment', 'Modern 2-bedroom apartment', 'apartment', 'Rent', 1200, '321 City Center', 'Casablanca', 'Grand Casablanca', '20000', 'Morocco', 2, 1, 900, 'active', CURDATE(), 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'),
    (@seller2, 'Studio Apartment', 'Compact studio in the city', 'apartment', 'Rent', 600, '654 Urban Plaza', 'Rabat', 'Rabat-Sale', '10000', 'Morocco', 1, 1, 450, 'rented', CURDATE(), 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'),
    (@seller3, 'Luxury Penthouse', 'Top floor penthouse with views', 'apartment', 'Sale', 500000, '987 Sky Tower', 'Casablanca', 'Grand Casablanca', '20000', 'Morocco', 3, 2, 1800, 'active', CURDATE(), 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'),
    
    -- Condo properties
    (@seller3, 'Beachside Condo', 'Ocean view condo', 'condo', 'Sale', 320000, '147 Beach Road', 'Agadir', 'Souss-Massa', '80000', 'Morocco', 2, 2, 1100, 'active', CURDATE(), 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'),
    
    -- Land properties
    (@seller1, 'Commercial Land Plot', 'Prime location for development', 'land', 'Sale', 150000, 'Plot 25 Industrial Zone', 'Tangier', 'Tanger-Tetouan', '90000', 'Morocco', 0, 0, 5000, 'active', CURDATE(), NULL),
    (@seller3, 'Residential Land', 'Build your dream home', 'land', 'Sale', 80000, 'Lot 12 Green Hills', 'Fes', 'Fes-Meknes', '30000', 'Morocco', 0, 0, 2000, 'sold', CURDATE(), NULL),
    
    -- Commercial properties
    (@seller2, 'Retail Space', 'Ground floor retail opportunity', 'commercial', 'Rent', 3000, '258 Shopping District', 'Casablanca', 'Grand Casablanca', '20000', 'Morocco', 0, 2, 2500, 'active', CURDATE(), 'https://images.unsplash.com/photo-1497366216548-37526070297c');

SELECT 'Dashboard seed data inserted successfully' AS status;


-- Content from seed_agents.sql
-- Seed agents table with all existing sellers
-- This creates agent records for all users with user_type = 'seller'

INSERT INTO agents (user_id, license_number, bio)
SELECT 
    u.user_id,
    CONCAT('LIC-', LPAD(u.user_id, 6, '0')) as license_number,
    CONCAT('Experienced real estate professional') as bio
FROM users u
WHERE u.user_type = 'seller'
  AND NOT EXISTS (
    SELECT 1 FROM agents a WHERE a.user_id = u.user_id
  );

-- Verify the seed
SELECT 
    a.agent_id,
    u.first_name,
    u.last_name,
    u.email,
    a.license_number
FROM agents a
JOIN users u ON a.user_id = u.user_id
ORDER BY u.first_name;


-- Content from seed_property_images.sql
-- Seed some properties with sample image URLs from Unsplash
UPDATE properties 
SET image_url = CASE property_id
    WHEN 2 THEN 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
    WHEN 6 THEN 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
    WHEN 7 THEN 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
    WHEN 8 THEN 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    WHEN 9 THEN 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800'
    WHEN 10 THEN 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800'
    WHEN 11 THEN 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
    WHEN 12 THEN 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'
    ELSE image_url
END
WHERE property_id IN (2, 6, 7, 8, 9, 10, 11, 12);


