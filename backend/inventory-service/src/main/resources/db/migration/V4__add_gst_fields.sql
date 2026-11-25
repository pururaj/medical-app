-- Add GST/HSN fields to medicines
ALTER TABLE medicines
    ADD COLUMN hsn_code    VARCHAR(20),
    ADD COLUMN gst_rate    DECIMAL(5,2) NOT NULL DEFAULT 12.00;

-- Create purchase_invoices table
CREATE TABLE purchase_invoices (
    id                BIGSERIAL     PRIMARY KEY,
    invoice_number    VARCHAR(100)  NOT NULL UNIQUE,
    supplier_name     VARCHAR(200)  NOT NULL,
    supplier_gstin    VARCHAR(20),
    invoice_date      DATE          NOT NULL,
    taxable_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    cgst_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
    sgst_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
    igst_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes             TEXT,
    created_by        VARCHAR(100),
    created_at        TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP
);

CREATE INDEX idx_purchase_invoice_date     ON purchase_invoices (invoice_date);
CREATE INDEX idx_purchase_invoice_supplier ON purchase_invoices (supplier_name);

-- Create purchase_invoice_items table
CREATE TABLE purchase_invoice_items (
    id                BIGSERIAL     PRIMARY KEY,
    invoice_id        BIGINT        NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    medicine_id       BIGINT        NOT NULL REFERENCES medicines(id),
    medicine_name     VARCHAR(200)  NOT NULL,
    hsn_code          VARCHAR(20),
    quantity          INTEGER       NOT NULL,
    unit_price        DECIMAL(10,2) NOT NULL,
    gst_rate          DECIMAL(5,2)  NOT NULL DEFAULT 12.00,
    taxable_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    cgst_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
    sgst_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
    igst_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
    line_total        DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchase_item_invoice  ON purchase_invoice_items (invoice_id);
CREATE INDEX idx_purchase_item_medicine ON purchase_invoice_items (medicine_id);
