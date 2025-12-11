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
