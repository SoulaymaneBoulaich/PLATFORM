-- presentation_seed.sql
-- Seed data for presentation (Target: >34 items)

USE real_estate_db;

-- 1. USERS (10 Users) --
-- We already have Alice, Bob, Carol from init.sql maybe, but let's ensure we have distinct ones.
-- Passwords are dummy hashes for presentation speed
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, bio, location) VALUES
('david.miller@example.com', '$2a$10$dummyhash', 'David', 'Miller', '555-0101', 'seller', 'Experienced developer', 'Casablanca'),
('emma.wilson@example.com', '$2a$10$dummyhash', 'Emma', 'Wilson', '555-0102', 'buyer', 'Looking for a family home', 'Rabat'),
('frank.moore@example.com', '$2a$10$dummyhash', 'Frank', 'Moore', '555-0103', 'agent', 'Top Agent 2024', 'Marrakech'),
('grace.taylor@example.com', '$2a$10$dummyhash', 'Grace', 'Taylor', '555-0104', 'buyer', 'First time buyer', 'Tangier'),
('henry.anderson@example.com', '$2a$10$dummyhash', 'Henry', 'Anderson', '555-0105', 'seller', 'Moving abroad', 'Agadir'),
('isabella.thomas@example.com', '$2a$10$dummyhash', 'Isabella', 'Thomas', '555-0106', 'agent', 'Luxury specialist', 'Casablanca'),
('jack.white@example.com', '$2a$10$dummyhash', 'Jack', 'White', '555-0107', 'buyer', 'Looking for investment', 'Fes'),
('karen.harris@example.com', '$2a$10$dummyhash', 'Karen', 'Harris', '555-0108', 'seller', 'Downsizing', 'Rabat'),
('liam.martin@example.com', '$2a$10$dummyhash', 'Liam', 'Martin', '555-0109', 'buyer', 'Need big garden', 'Marrakech'),
('mia.thompson@example.com', '$2a$10$dummyhash', 'Mia', 'Thompson', '555-0110', 'admin', 'System Administrator', 'Casablanca')
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);

-- 2. PROPERTIES (15 Properties) --
-- Using variables for seller IDs for safety
SET @seller_david = (SELECT user_id FROM users WHERE email = 'david.miller@example.com');
SET @seller_henry = (SELECT user_id FROM users WHERE email = 'henry.anderson@example.com');
SET @seller_karen = (SELECT user_id FROM users WHERE email = 'karen.harris@example.com');

INSERT INTO properties (seller_id, title, description, property_type, listing_type, price, address_line1, city, state, zip_code, country, bedrooms, bathrooms, area_sqft, status, listing_date, image_url) VALUES
(@seller_david, 'Sunny Villa with Pool', 'Amazing villa in the suburbs', 'house', 'sale', 450000, '12 Sunset Blvd', 'Casablanca', 'Casa', '20100', 'Morocco', 4, 3, 2500, 'active', CURDATE(), 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800'),
(@seller_david, 'Modern City Apartment', 'Close to business district', 'apartment', 'rent', 1500, '45 Finance St', 'Casablanca', 'Casa', '20200', 'Morocco', 2, 2, 1100, 'active', CURDATE(), 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'),
(@seller_david, 'Cozy Studio', 'Perfect for students', 'apartment', 'rent', 600, '88 University Rd', 'Rabat', 'Rabat-Sale', '10100', 'Morocco', 1, 1, 500, 'active', CURDATE(), 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'),
(@seller_henry, 'Ocean View Condo', 'Wake up to the ocean', 'condo', 'sale', 320000, '99 Beach Ave', 'Agadir', 'Souss', '80000', 'Morocco', 2, 2, 1200, 'active', CURDATE(), 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'),
(@seller_henry, 'Mountain Retreat', 'Quiet place in the mountains', 'house', 'sale', 200000, '12 High Rd', 'Ifrane', 'Fes-Meknes', '53000', 'Morocco', 3, 2, 1800, 'active', CURDATE(), 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'),
(@seller_henry, 'Commercial Shop', 'High footfall area', 'commercial', 'rent', 2500, '5 Market St', 'Marrakech', 'Marrakech', '40000', 'Morocco', 0, 1, 800, 'active', CURDATE(), 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'),
(@seller_karen, 'Traditional Riad', 'Authentic Moroccan style', 'house', 'sale', 550000, '3 Medina Ln', 'Fes', 'Fes', '30000', 'Morocco', 5, 5, 3000, 'active', CURDATE(), 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'),
(@seller_karen, 'Starter Home', 'Great for new families', 'house', 'sale', 150000, '77 Maple Dr', 'Tangier', 'Tangier', '90000', 'Morocco', 2, 1, 900, 'active', CURDATE(), 'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800'),
(@seller_karen, 'Luxury Penthouse 2', 'Top of existing reviews', 'apartment', 'sale', 950000, '1 Skyline', 'Casablanca', 'Casa', '20000', 'Morocco', 3, 3, 2200, 'active', CURDATE(), 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'),
(@seller_david, 'Fixer Upper', 'Needs work but good price', 'house', 'sale', 100000, '44 Old Rd', 'Meknes', 'Fes-Meknes', '50000', 'Morocco', 3, 1, 1400, 'active', CURDATE(), 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'),
(@seller_david, 'Beach Land', 'Build your own villa', 'land', 'sale', 120000, 'Lot 55 Beach', 'Tetouan', 'Tangier', '93000', 'Morocco', 0, 0, 4000, 'active', CURDATE(), NULL),
(@seller_henry, 'Office Space', 'Modern office building', 'commercial', 'rent', 4000, '100 Business Park', 'Casablanca', 'Casa', '20150', 'Morocco', 0, 4, 3500, 'active', CURDATE(), 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'),
(@seller_henry, 'Garden Apartment', 'Ground floor with garden', 'apartment', 'sale', 220000, '23 Green St', 'Rabat', 'Rabat', '10000', 'Morocco', 2, 2, 1000, 'active', CURDATE(), 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'),
(@seller_karen, 'Historic Villa', '1920s architecture', 'house', 'sale', 600000, '8 Colonial Dr', 'Casablanca', 'Casa', '20050', 'Morocco', 6, 4, 4000, 'active', CURDATE(), 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'),
(@seller_karen, 'Tiny House', 'Minimalist living', 'house', 'rent', 800, '99 Eco Way', 'Marrakech', 'Marrakech', '40000', 'Morocco', 1, 1, 400, 'active', CURDATE(), 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800');

-- 3. REVIEWS (5 Reviews) --
-- Assuming property IDs are auto-incremented, we target roughly the last ones
SET @prop1 = (SELECT property_id FROM properties WHERE title = 'Sunny Villa with Pool' LIMIT 1);
SET @prop2 = (SELECT property_id FROM properties WHERE title = 'Modern City Apartment' LIMIT 1);
SET @buyer_emma = (SELECT user_id FROM users WHERE email = 'emma.wilson@example.com');
SET @buyer_grace = (SELECT user_id FROM users WHERE email = 'grace.taylor@example.com');

INSERT INTO property_reviews (property_id, user_id, rating, comment) VALUES
(@prop1, @buyer_emma, 5, 'Absolutely stunning property! The pool is larger than expected.'),
(@prop1, @buyer_grace, 4, 'Great location, but a bit pricey.'),
(@prop2, @buyer_emma, 5, 'Perfect for my business trips.'),
(@prop2, @buyer_grace, 3, 'Noisy neighbors at night.'),
(@prop2, @buyer_emma, 4, 'Very modern and clean.');

-- 4. APPOINTMENTS (5 Appointments) --
INSERT INTO appointments (property_id, user_id, appointment_date, status, notes) VALUES
(@prop1, @buyer_emma, DATE_ADD(NOW(), INTERVAL 2 DAY), 'scheduled', 'First viewing'),
(@prop2, @buyer_grace, DATE_ADD(NOW(), INTERVAL 3 DAY), 'scheduled', 'Second viewing'),
(@prop1, @buyer_grace, DATE_ADD(NOW(), INTERVAL 5 DAY), 'scheduled', 'Bringing my partner'),
(@prop2, @buyer_emma, DATE_ADD(NOW(), INTERVAL 1 DAY), 'completed', 'Went well'),
(@prop1, @buyer_emma, DATE_ADD(NOW(), INTERVAL 10 DAY), 'cancelled', 'Found another place');

-- 5. AGENTS (Ensure records for new agents) --
INSERT INTO agents (user_id, license_number, agency_name, bio)
SELECT user_id, CONCAT('LIC-NEW-', user_id), 'Premium Realty', 'Top tier agent'
FROM users WHERE user_type = 'agent' AND email IN ('frank.moore@example.com', 'isabella.thomas@example.com')
ON DUPLICATE KEY UPDATE bio=VALUES(bio);

-- 6. MESSAGES (Some conversation starters) --
-- Not implementing complex conversation logic in seed, just ensured data for presentation counts.
-- Total inserts here: 10 Users + 15 Properties + 5 Reviews + 5 Appointments + 2 Agents = 37 items. Success.

SELECT 'Presentation data seeded successfully (35+ new records)' as status;
