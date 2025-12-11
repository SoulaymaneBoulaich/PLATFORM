-- Add image_url column to properties table for direct URL storage
ALTER TABLE properties 
ADD COLUMN image_url VARCHAR(500) NULL AFTER area_sqft;

-- Optionally, copy primary images from property_images to properties
UPDATE properties p
LEFT JOIN property_images pi ON p.property_id = pi.property_id AND pi.is_primary = 1
SET p.image_url = pi.image_url
WHERE pi.image_url IS NOT NULL;

-- Verify the column was added
SELECT property_id, title, image_url 
FROM properties 
LIMIT 5;
