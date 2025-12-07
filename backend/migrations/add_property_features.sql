-- Add new property types: villa and studio
ALTER TABLE properties
MODIFY COLUMN property_type ENUM(
  'house',
  'apartment',
  'condo',
  'land',
  'commercial',
  'villa',
  'studio'
) NOT NULL;

-- Add boolean feature columns
ALTER TABLE properties
  ADD COLUMN has_garage BOOLEAN DEFAULT FALSE,
  ADD COLUMN has_pool BOOLEAN DEFAULT FALSE,
  ADD COLUMN has_garden BOOLEAN DEFAULT FALSE;
