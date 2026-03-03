CREATE TABLE sale_returns (
    id                  BIGSERIAL     PRIMARY KEY,
    return_number       VARCHAR(30)   UNIQUE,
    original_sale_id    BIGINT        NOT NULL REFERENCES sales(id),
    return_reason       TEXT,
    total_refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    processed_by        VARCHAR(100),
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE sale_return_items (
    id                    BIGSERIAL     PRIMARY KEY,
    sale_return_id        BIGINT        NOT NULL REFERENCES sale_returns(id) ON DELETE CASCADE,
    original_sale_item_id BIGINT,
    medicine_id           BIGINT        NOT NULL,
    medicine_name         VARCHAR(200)  NOT NULL,
    quantity_returned     INTEGER       NOT NULL,
    unit_price            DECIMAL(10,2) NOT NULL,
    refund_amount         DECIMAL(10,2) NOT NULL,
    created_at            TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_return_number      ON sale_returns (return_number);
CREATE INDEX idx_return_sale        ON sale_returns (original_sale_id);
CREATE INDEX idx_return_items_ret   ON sale_return_items (sale_return_id);
