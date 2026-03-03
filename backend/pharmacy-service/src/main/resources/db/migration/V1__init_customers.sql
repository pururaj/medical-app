CREATE TABLE customers (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    email       VARCHAR(200),
    address     VARCHAR(500),
    patient_id  BIGINT,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP
);

CREATE INDEX idx_customer_name  ON customers (name);
CREATE INDEX idx_customer_phone ON customers (phone);

-- Seed walk-in customers
INSERT INTO customers (name, phone, email, address, active, created_at) VALUES
('Rajesh Kumar',    '9876543210', 'rajesh.kumar@email.com',  '12 MG Road, Bangalore',         TRUE, NOW()),
('Priya Sharma',    '8765432109', 'priya.sharma@email.com',  '45 Anna Nagar, Chennai',         TRUE, NOW()),
('Mohammed Farhan', '7654321098', 'farhan.m@email.com',      '78 Banjara Hills, Hyderabad',    TRUE, NOW());
