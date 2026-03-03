CREATE TABLE medicines (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    generic_name VARCHAR(200),
    category VARCHAR(20) NOT NULL,
    manufacturer VARCHAR(200),
    description TEXT,
    unit VARCHAR(10) NOT NULL,
    unit_price DECIMAL(10, 2),
    reorder_level INTEGER NOT NULL DEFAULT 10,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE INDEX idx_medicine_name ON medicines (name);
CREATE INDEX idx_medicine_category ON medicines (category);
CREATE INDEX idx_medicine_active ON medicines (active);

-- Seed some common medicines
INSERT INTO medicines (name, generic_name, category, manufacturer, unit, unit_price, reorder_level, active, created_at) VALUES
('Paracetamol 500mg', 'Acetaminophen', 'TABLET', 'Generic Pharma', 'TABLET', 0.50, 100, TRUE, NOW()),
('Amoxicillin 250mg', 'Amoxicillin', 'CAPSULE', 'MedCo', 'CAPSULE', 1.20, 50, TRUE, NOW()),
('Ibuprofen 400mg', 'Ibuprofen', 'TABLET', 'Generic Pharma', 'TABLET', 0.80, 80, TRUE, NOW()),
('Cetirizine 10mg', 'Cetirizine HCl', 'TABLET', 'AllergyMed', 'TABLET', 0.60, 50, TRUE, NOW()),
('Omeprazole 20mg', 'Omeprazole', 'CAPSULE', 'GastroMed', 'CAPSULE', 1.50, 40, TRUE, NOW()),
('Metformin 500mg', 'Metformin HCl', 'TABLET', 'DiabeteCare', 'TABLET', 0.90, 60, TRUE, NOW()),
('Normal Saline 500ml', 'Sodium Chloride 0.9%', 'INJECTION', 'IV Fluids Ltd', 'ML', 2.50, 20, TRUE, NOW()),
('Syrup Amoxicillin 125mg/5ml', 'Amoxicillin', 'SYRUP', 'PediaPharma', 'ML', 3.00, 30, TRUE, NOW());
