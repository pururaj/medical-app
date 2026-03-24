ALTER TABLE medicines ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS idx_medicine_barcode ON medicines(barcode) WHERE barcode IS NOT NULL;
