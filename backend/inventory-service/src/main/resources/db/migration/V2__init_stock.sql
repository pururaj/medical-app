CREATE TABLE inventory_stock (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL REFERENCES medicines(id),
    batch_number VARCHAR(100),
    current_quantity INTEGER NOT NULL DEFAULT 0,
    expiry_date DATE,
    supplier VARCHAR(200),
    received_date DATE,
    location VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE INDEX idx_stock_medicine ON inventory_stock (medicine_id);
CREATE INDEX idx_stock_expiry ON inventory_stock (expiry_date);

CREATE TABLE stock_transactions (
    id BIGSERIAL PRIMARY KEY,
    medicine_id BIGINT NOT NULL REFERENCES medicines(id),
    transaction_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    notes TEXT,
    performed_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_transaction_medicine ON stock_transactions (medicine_id);
CREATE INDEX idx_transaction_type ON stock_transactions (transaction_type);
CREATE INDEX idx_transaction_date ON stock_transactions (created_at);

-- Seed initial stock for the seeded medicines
INSERT INTO inventory_stock (medicine_id, batch_number, current_quantity, expiry_date, supplier, received_date, location, created_at)
SELECT id, 'INIT-' || id::TEXT, 200, NOW()::DATE + INTERVAL '1 year', 'Initial Supplier', NOW()::DATE, 'Shelf-A', NOW()
FROM medicines WHERE name IN ('Paracetamol 500mg', 'Ibuprofen 400mg', 'Cetirizine 10mg', 'Omeprazole 20mg', 'Metformin 500mg');

-- Low stock items (quantity below reorder level of 50)
INSERT INTO inventory_stock (medicine_id, batch_number, current_quantity, expiry_date, supplier, received_date, location, created_at)
SELECT id, 'LOW-' || id::TEXT, 15, NOW()::DATE + INTERVAL '6 months', 'Initial Supplier', NOW()::DATE, 'Shelf-B', NOW()
FROM medicines WHERE name IN ('Amoxicillin 250mg', 'Normal Saline 500ml');
