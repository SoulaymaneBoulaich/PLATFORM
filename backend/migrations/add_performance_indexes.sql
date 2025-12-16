-- ============================================
-- Performance Optimization - Add Composite Indexes
-- ============================================

USE real_estate_db;

-- Add composite index for conversation participant lookups
-- This speeds up finding conversations for a specific user
ALTER TABLE conversation_participants 
ADD INDEX idx_conv_user (conversation_id, user_id);

-- Add composite index for property searches by city and type
-- This optimizes filtered property searches
ALTER TABLE properties 
ADD INDEX idx_city_type (city, property_type);

-- Add composite index for property searches by city and price
-- This optimizes price-filtered searches
ALTER TABLE properties 
ADD INDEX idx_city_price (city, price);

-- Add covering index for message queries
-- This includes created_at in DESC order for efficient "latest message" queries
ALTER TABLE messages 
ADD INDEX idx_conv_created (conversation_id, created_at DESC);

-- Add index on properties owner_id (if renamed from seller_id)
-- Currently using seller_id, so adding index there
CREATE INDEX idx_seller ON properties(seller_id);

-- Add index for visit queries
ALTER TABLE visits
ADD INDEX idx_buyer_property (buyer_id, property_id);

ALTER TABLE visits
ADD INDEX idx_property_status (property_id, status);

-- Add index for favorite counts
ALTER TABLE favorites
ADD INDEX idx_property_user (property_id, user_id);

SELECT '✅ Performance indexes added successfully!' as Status;
