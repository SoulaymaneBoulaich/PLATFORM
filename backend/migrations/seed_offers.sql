-- Seed offers for presentation and tests
USE real_estate_db;

-- Grab some known properties and users seeded by seed_presentation_data.sql
SET @prop_villa = (SELECT property_id FROM properties WHERE title = 'Sunny Villa with Pool' LIMIT 1);
SET @prop_apartment = (SELECT property_id FROM properties WHERE title = 'Modern City Apartment' LIMIT 1);
SET @prop_studio = (SELECT property_id FROM properties WHERE title = 'Cozy Studio' LIMIT 1);

SET @emma = (SELECT user_id FROM users WHERE email = 'emma.wilson@example.com' LIMIT 1);
SET @grace = (SELECT user_id FROM users WHERE email = 'grace.taylor@example.com' LIMIT 1);
SET @liam = (SELECT user_id FROM users WHERE email = 'liam.martin@example.com' LIMIT 1);

SET @seller_villa = (SELECT seller_id FROM properties WHERE property_id = @prop_villa LIMIT 1);

-- Insert offers idempotently
INSERT INTO offers (property_id, buyer_id, seller_id, amount, status, message)
SELECT @prop_villa, @emma, @seller_villa, 430000.00, 'Pending', 'Seed - strong offer (Emma)'
WHERE @prop_villa IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM offers WHERE property_id = @prop_villa AND buyer_id = @emma AND amount = 430000.00
);

INSERT INTO offers (property_id, buyer_id, seller_id, amount, status, message)
SELECT @prop_villa, @grace, @seller_villa, 440000.00, 'Countered', 'Seed - counter from seller to Grace'
WHERE @prop_villa IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM offers WHERE property_id = @prop_villa AND buyer_id = @grace AND amount = 440000.00
);

INSERT INTO offers (property_id, buyer_id, seller_id, amount, status, message)
SELECT @prop_apartment, @liam, (SELECT seller_id FROM properties WHERE property_id = @prop_apartment), 1400.00, 'Pending', 'Seed - monthly rental offer (Liam)'
WHERE @prop_apartment IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM offers WHERE property_id = @prop_apartment AND buyer_id = @liam AND amount = 1400.00
);

INSERT INTO offers (property_id, buyer_id, seller_id, amount, status, message)
SELECT @prop_studio, @grace, (SELECT seller_id FROM properties WHERE property_id = @prop_studio), 600.00, 'Accepted', 'Seed - already accepted offer (Grace)'
WHERE @prop_studio IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM offers WHERE property_id = @prop_studio AND buyer_id = @grace AND amount = 600.00
);

SELECT 'Offers seed applied (idempotent)' as status;
