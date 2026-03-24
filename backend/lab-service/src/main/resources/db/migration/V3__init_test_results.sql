CREATE TABLE IF NOT EXISTS test_results (
    id                  BIGSERIAL PRIMARY KEY,
    lab_order_item_id   BIGINT        NOT NULL UNIQUE REFERENCES lab_order_items(id),
    lab_order_id        BIGINT        NOT NULL,
    test_code           VARCHAR(50)   NOT NULL,
    test_name           VARCHAR(200)  NOT NULL,
    result_value        VARCHAR(200)  NOT NULL,
    unit                VARCHAR(50),
    reference_range     VARCHAR(200),
    is_abnormal         BOOLEAN       NOT NULL DEFAULT FALSE,
    remarks             VARCHAR(500),
    entered_by          VARCHAR(100),
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tr_lab_order_id ON test_results(lab_order_id);
CREATE INDEX idx_tr_is_abnormal  ON test_results(is_abnormal);

-- Seed results for the completed order (LAB-20260101-0001)
INSERT INTO test_results (lab_order_item_id, lab_order_id, test_code, test_name, result_value, unit, reference_range, is_abnormal, remarks, entered_by, created_at)
SELECT
    i.id,
    i.lab_order_id,
    i.test_code,
    i.test_name,
    CASE i.test_code
        WHEN 'CBC'  THEN '13.5 g/dL'
        WHEN 'FBS'  THEN '125 mg/dL'
    END,
    CASE i.test_code
        WHEN 'CBC'  THEN 'g/dL'
        WHEN 'FBS'  THEN 'mg/dL'
    END,
    CASE i.test_code
        WHEN 'CBC'  THEN '12-17 g/dL'
        WHEN 'FBS'  THEN '70-100 mg/dL'
    END,
    CASE i.test_code
        WHEN 'CBC'  THEN FALSE
        WHEN 'FBS'  THEN TRUE
    END,
    CASE i.test_code
        WHEN 'FBS'  THEN 'Slightly elevated - advise diet control'
        ELSE NULL
    END,
    'Lab Tech A',
    NOW() - INTERVAL '1 hour'
FROM lab_order_items i
JOIN lab_orders o ON o.id = i.lab_order_id
WHERE o.order_number = 'LAB-20260101-0001';
