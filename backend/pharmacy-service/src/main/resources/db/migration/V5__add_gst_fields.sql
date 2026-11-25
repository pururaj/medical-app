-- Add GST columns to sales
ALTER TABLE sales
    ADD COLUMN taxable_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN cgst_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN sgst_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN igst_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN gst_rate       DECIMAL(5,2)  NOT NULL DEFAULT 12.00;

-- Backfill existing sales: treat subtotal_amount as taxable, split 12% GST as 6+6
UPDATE sales
SET taxable_amount = subtotal_amount,
    cgst_amount    = ROUND(subtotal_amount * 0.06, 2),
    sgst_amount    = ROUND(subtotal_amount * 0.06, 2),
    igst_amount    = 0,
    gst_rate       = 12.00;

-- Add GST columns to sale_items
ALTER TABLE sale_items
    ADD COLUMN gst_rate       DECIMAL(5,2)  NOT NULL DEFAULT 12.00,
    ADD COLUMN taxable_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN cgst_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN sgst_amount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN igst_amount    DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Backfill existing sale items
UPDATE sale_items
SET taxable_amount = line_total,
    cgst_amount    = ROUND(line_total * 0.06, 2),
    sgst_amount    = ROUND(line_total * 0.06, 2),
    igst_amount    = 0,
    gst_rate       = 12.00;
