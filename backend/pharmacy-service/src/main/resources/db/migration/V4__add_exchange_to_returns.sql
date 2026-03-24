-- Add exchange support to sale_returns
ALTER TABLE sale_returns
    ADD COLUMN transaction_type VARCHAR(20) NOT NULL DEFAULT 'RETURN',
    ADD COLUMN exchange_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN net_settlement   DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Exchange items: medicines given in place of returned ones
CREATE TABLE sale_exchange_items (
    id              BIGSERIAL     PRIMARY KEY,
    sale_return_id  BIGINT        NOT NULL REFERENCES sale_returns(id) ON DELETE CASCADE,
    medicine_id     BIGINT        NOT NULL,
    medicine_name   VARCHAR(200)  NOT NULL,
    medicine_unit   VARCHAR(20),
    quantity        INTEGER       NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    line_total      DECIMAL(10,2) NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exchange_items_ret ON sale_exchange_items (sale_return_id);
