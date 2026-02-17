-- Create patients table
CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    blood_type VARCHAR(50),
    allergies TEXT,
    medical_history TEXT,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for better query performance
CREATE INDEX idx_email ON patients(email);
CREATE INDEX idx_phone ON patients(phone_number);
CREATE INDEX idx_active ON patients(active);
CREATE INDEX idx_created_at ON patients(created_at);

-- Comments for documentation
COMMENT ON TABLE patients IS 'Stores patient demographic and contact information';
COMMENT ON COLUMN patients.active IS 'Soft delete flag - false means patient is deactivated';
COMMENT ON COLUMN patients.medical_history IS 'HIPAA-compliant encrypted medical history';
COMMENT ON COLUMN patients.allergies IS 'Known allergies and adverse reactions';
