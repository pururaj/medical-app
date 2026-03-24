CREATE TABLE IF NOT EXISTS lab_orders (
    id           BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(30)  UNIQUE,
    patient_id   BIGINT,
    patient_name VARCHAR(200) NOT NULL,
    patient_phone VARCHAR(20),
    doctor_name  VARCHAR(200),
    status       VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    sample_id    VARCHAR(100),
    sample_type  VARCHAR(20),
    collected_at TIMESTAMP,
    collected_by VARCHAR(100),
    notes        VARCHAR(500),
    processed_by VARCHAR(100),
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP
);

CREATE INDEX idx_lo_order_number ON lab_orders(order_number);
CREATE INDEX idx_lo_patient_id   ON lab_orders(patient_id);
CREATE INDEX idx_lo_status       ON lab_orders(status);
CREATE INDEX idx_lo_created_at   ON lab_orders(created_at);

CREATE TABLE IF NOT EXISTS lab_order_items (
    id                 BIGSERIAL PRIMARY KEY,
    lab_order_id       BIGINT        NOT NULL REFERENCES lab_orders(id),
    test_catalogue_id  BIGINT,
    test_code          VARCHAR(50)   NOT NULL,
    test_name          VARCHAR(200)  NOT NULL,
    price              NUMERIC(10,2) NOT NULL,
    created_at         TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loi_lab_order_id ON lab_order_items(lab_order_id);

-- Seed order 1: COMPLETED
INSERT INTO lab_orders (order_number, patient_id, patient_name, patient_phone, doctor_name, status, sample_id, sample_type, collected_at, collected_by, processed_by, created_at, updated_at)
VALUES ('LAB-20260101-0001', 1, 'Rajesh Kumar', '9876543210', 'Dr. Sharma', 'COMPLETED', 'SMP-001', 'BLOOD', NOW() - INTERVAL '2 hours', 'Lab Tech A', 'Admin', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour');

INSERT INTO lab_order_items (lab_order_id, test_catalogue_id, test_code, test_name, price, created_at)
VALUES
((SELECT id FROM lab_orders WHERE order_number='LAB-20260101-0001'), (SELECT id FROM test_catalogue WHERE test_code='CBC'),  'CBC',  'Complete Blood Count',  250.00, NOW() - INTERVAL '3 hours'),
((SELECT id FROM lab_orders WHERE order_number='LAB-20260101-0001'), (SELECT id FROM test_catalogue WHERE test_code='FBS'),  'FBS',  'Fasting Blood Sugar',   150.00, NOW() - INTERVAL '3 hours');

-- Seed order 2: PENDING
INSERT INTO lab_orders (order_number, patient_id, patient_name, patient_phone, doctor_name, status, processed_by, created_at, updated_at)
VALUES ('LAB-20260101-0002', 2, 'Priya Singh', '9988776655', 'Dr. Mehta', 'PENDING', 'Receptionist', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes');

INSERT INTO lab_order_items (lab_order_id, test_catalogue_id, test_code, test_name, price, created_at)
VALUES
((SELECT id FROM lab_orders WHERE order_number='LAB-20260101-0002'), (SELECT id FROM test_catalogue WHERE test_code='TSH'),  'TSH',  'Thyroid Stimulating Hormone', 600.00, NOW() - INTERVAL '30 minutes'),
((SELECT id FROM lab_orders WHERE order_number='LAB-20260101-0002'), (SELECT id FROM test_catalogue WHERE test_code='LFT'),  'LFT',  'Liver Function Test',         500.00, NOW() - INTERVAL '30 minutes');
