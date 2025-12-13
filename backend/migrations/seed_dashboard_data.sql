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
    (@seller1, 'Modern Family House', 'Beautiful 3-bedroom house with garden', 'house', 'Sale', 350000, '123 Oak Street', 'Casablanca', 'Grand Casablanca', '20000', 'Morocco', 3, 2, 1500, 'active', CURDATE(), 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'),
    (@seller1, 'Cozy Suburban Home', 'Perfect starter home', 'house', 'Sale', 280000, '456 Maple Ave', 'Rabat', 'Rabat-Sale', '10000', 'Morocco', 2, 1, 1200, 'sold', CURDATE(), 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'),
    (@seller2, 'Luxury Villa', 'Stunning villa with pool', 'villa', 'Sale', 850000, '789 Palm Road', 'Marrakech', 'Marrakech-Safi', '40000', 'Morocco', 5, 4, 3500, 'active', CURDATE(), 'https://images.unsplash.com/photo-1613490493576-7fde63acd811'),
    
    -- Apartment properties
    (@seller2, 'Downtown Apartment', 'Modern 2-bedroom apartment', 'apartment', 'Rent', 1200, '321 City Center', 'Casablanca', 'Grand Casablanca', '20000', 'Morocco', 2, 1, 900, 'active', CURDATE(), 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'),
    (@seller2, 'Studio Apartment', 'Compact studio in the city', 'studio', 'Rent', 600, '654 Urban Plaza', 'Rabat', 'Rabat-Sale', '10000', 'Morocco', 1, 1, 450, 'rented', CURDATE(), 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'),
    (@seller3, 'Luxury Penthouse', 'Top floor penthouse with views', 'apartment', 'Sale', 500000, '987 Sky Tower', 'Casablanca', 'Grand Casablanca', '20000', 'Morocco', 3, 2, 1800, 'active', CURDATE(), 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'),
    
    -- Condo properties
    (@seller3, 'Beachside Condo', 'Ocean view condo', 'condo', 'Sale', 320000, '147 Beach Road', 'Agadir', 'Souss-Massa', '80000', 'Morocco', 2, 2, 1100, 'active', CURDATE(), 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'),
    
    -- Land properties
    (@seller1, 'Commercial Land Plot', 'Prime location for development', 'land', 'Sale', 150000, 'Plot 25 Industrial Zone', 'Tangier', 'Tanger-Tetouan', '90000', 'Morocco', 0, 0, 5000, 'active', CURDATE(), NULL),
    (@seller3, 'Residential Land', 'Build your dream home', 'land', 'Sale', 80000, 'Lot 12 Green Hills', 'Fes', 'Fes-Meknes', '30000', 'Morocco', 0, 0, 2000, 'sold', CURDATE(), NULL),
    
    -- Commercial properties
    (@seller2, 'Retail Space', 'Ground floor retail opportunity', 'commercial', 'Rent', 3000, '258 Shopping District', 'Casablanca', 'Grand Casablanca', '20000', 'Morocco', 0, 2, 2500, 'active', CURDATE(), 'https://images.unsplash.com/photo-1497366216548-37526070297c');

SELECT 'Dashboard seed data inserted successfully' AS status;
