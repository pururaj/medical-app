CREATE TABLE IF NOT EXISTS test_catalogue (
    id               BIGSERIAL PRIMARY KEY,
    test_code        VARCHAR(50)     NOT NULL UNIQUE,
    test_name        VARCHAR(200)    NOT NULL,
    category         VARCHAR(100),
    description      VARCHAR(500),
    sample_type      VARCHAR(20)     NOT NULL,
    price            NUMERIC(10,2)   NOT NULL,
    turnaround_hours INT,
    reference_range  VARCHAR(200),
    unit             VARCHAR(50),
    active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP
);

CREATE INDEX idx_tc_test_code ON test_catalogue(test_code);
CREATE INDEX idx_tc_active    ON test_catalogue(active);

-- Seed data: 10 common lab tests
INSERT INTO test_catalogue (test_code, test_name, category, description, sample_type, price, turnaround_hours, reference_range, unit)
VALUES
('CBC',     'Complete Blood Count',        'Haematology',   'Evaluates overall health and detects disorders', 'BLOOD', 250.00,  4,  NULL,              NULL),
('LFT',     'Liver Function Test',         'Biochemistry',  'Assesses liver function and health',             'BLOOD', 500.00,  6,  NULL,              NULL),
('RFT',     'Renal Function Test',         'Biochemistry',  'Evaluates kidney function',                      'BLOOD', 450.00,  6,  NULL,              NULL),
('LIPID',   'Lipid Profile',               'Biochemistry',  'Measures cholesterol and triglycerides',         'BLOOD', 400.00,  6,  NULL,              NULL),
('FBS',     'Fasting Blood Sugar',         'Biochemistry',  'Measures glucose levels after fasting',          'BLOOD', 150.00,  2,  '70-100 mg/dL',    'mg/dL'),
('URE',     'Urine Routine Examination',   'Microbiology',  'General analysis of urine',                      'URINE', 200.00,  3,  NULL,              NULL),
('TSH',     'Thyroid Stimulating Hormone', 'Endocrinology', 'Evaluates thyroid gland function',               'BLOOD', 600.00,  8,  '0.4-4.0 mIU/L',  'mIU/L'),
('HBA1C',   'HbA1c (Glycated Haemoglobin)','Biochemistry', 'Measures average blood sugar over 3 months',     'BLOOD', 500.00,  6,  '<5.7%',           '%'),
('DENGUE',  'Dengue NS1 Antigen',          'Serology',      'Detects early dengue fever infection',           'BLOOD', 800.00, 12,  NULL,              NULL),
('COVID19', 'COVID-19 Antigen Test',       'Virology',      'Rapid antigen test for SARS-CoV-2',              'SWAB',  350.00,  1,  'Negative',        NULL);
