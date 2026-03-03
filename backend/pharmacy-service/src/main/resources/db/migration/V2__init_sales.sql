CREATE TABLE sales (
    id               BIGSERIAL    PRIMARY KEY,
    sale_number      VARCHAR(30)  UNIQUE,
    customer_id      BIGINT       REFERENCES customers(id),
    customer_name    VARCHAR(200),
    customer_phone   VARCHAR(20),
    subtotal_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount  DECIMAL(10,2)          DEFAULT 0,
    total_amount     DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method   VARCHAR(20)  NOT NULL,
    payment_status   VARCHAR(20)  NOT NULL DEFAULT 'PAID',
    status           VARCHAR(30)  NOT NULL DEFAULT 'COMPLETED',
    notes            TEXT,
    processed_by     VARCHAR(100),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP
);

CREATE TABLE sale_items (
    id            BIGSERIAL     PRIMARY KEY,
    sale_id       BIGINT        NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    medicine_id   BIGINT        NOT NULL,
    medicine_name VARCHAR(200)  NOT NULL,
    medicine_unit VARCHAR(20),
    quantity      INTEGER       NOT NULL,
    unit_price    DECIMAL(10,2) NOT NULL,
    line_total    DECIMAL(10,2) NOT NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sale_number     ON sales (sale_number);
CREATE INDEX idx_sale_status     ON sales (status);
CREATE INDEX idx_sale_created_at ON sales (created_at);
CREATE INDEX idx_sale_items_sale ON sale_items (sale_id);

-- Seed: 2 completed sales linked to seeded customers
INSERT INTO sales (sale_number, customer_id, customer_name, customer_phone, subtotal_amount, discount_amount, total_amount, payment_method, payment_status, status, processed_by, created_at)
VALUES
('SALE-20260303-0001', 1, 'Rajesh Kumar',    '9876543210', 11.00, 1.00, 10.00, 'CASH',  'PAID', 'COMPLETED', 'admin', NOW()),
('SALE-20260303-0002', 2, 'Priya Sharma',    '8765432109',  6.00, 0.00,  6.00, 'UPI',   'PAID', 'COMPLETED', 'admin', NOW());

INSERT INTO sale_items (sale_id, medicine_id, medicine_name, medicine_unit, quantity, unit_price, line_total, created_at)
VALUES
-- Sale 1: Paracetamol x10 + Cetirizine x5
(1, 1, 'Paracetamol 500mg',  'TABLET', 10, 0.50, 5.00, NOW()),
(1, 4, 'Cetirizine 10mg',    'TABLET', 10, 0.60, 6.00, NOW()),
-- Sale 2: Ibuprofen x5 + Amoxicillin x3
(2, 3, 'Ibuprofen 400mg',    'TABLET',  5, 0.80, 4.00, NOW()),
(2, 2, 'Amoxicillin 250mg',  'CAPSULE', 2, 1.20, 2.40, NOW());
