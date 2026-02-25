-- Create doctors table
CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    specialization VARCHAR(100) NOT NULL,
    sub_specialization VARCHAR(100),
    qualification VARCHAR(500) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    hospital_name VARCHAR(200),
    department VARCHAR(100),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    consultation_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    consultation_duration_minutes INTEGER NOT NULL DEFAULT 30,
    bio TEXT,
    profile_image_url VARCHAR(500),
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_ratings INTEGER DEFAULT 0,
    available BOOLEAN NOT NULL DEFAULT true,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT chk_experience CHECK (experience_years >= 0),
    CONSTRAINT chk_fee CHECK (consultation_fee >= 0),
    CONSTRAINT chk_duration CHECK (consultation_duration_minutes > 0),
    CONSTRAINT chk_rating CHECK (average_rating >= 0 AND average_rating <= 5)
);

-- Indexes for query performance
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_available ON doctors(available);
CREATE INDEX idx_doctors_active ON doctors(active);
CREATE INDEX idx_doctors_city ON doctors(city);
CREATE INDEX idx_doctors_license ON doctors(license_number);

-- Comments
COMMENT ON TABLE doctors IS 'Stores doctor profiles, credentials, and availability';
COMMENT ON COLUMN doctors.available IS 'Whether the doctor is currently accepting new appointments';
COMMENT ON COLUMN doctors.active IS 'Soft delete flag - false means doctor account is deactivated';
COMMENT ON COLUMN doctors.average_rating IS 'Computed average from patient ratings (0.00 - 5.00)';
COMMENT ON COLUMN doctors.license_number IS 'Medical council registration/license number';

-- Seed sample doctors
INSERT INTO doctors (first_name, last_name, email, phone_number, specialization, qualification, experience_years, license_number, hospital_name, department, city, consultation_fee, consultation_duration_minutes, bio, available, active)
VALUES
    ('Aisha', 'Sharma', 'aisha.sharma@medicalhospital.com', '+911234567890', 'Cardiology', 'MBBS, MD (Cardiology), DM (Cardiology)', 15, 'MCI-CARD-001', 'City Medical Center', 'Cardiology', 'Mumbai', 800.00, 30, 'Senior cardiologist with 15 years of experience in interventional cardiology and heart failure management.', true, true),
    ('Rahul', 'Verma', 'rahul.verma@medicalhospital.com', '+912345678901', 'Orthopedics', 'MBBS, MS (Orthopedics), DNB', 12, 'MCI-ORTH-002', 'City Medical Center', 'Orthopedics', 'Mumbai', 700.00, 30, 'Specialist in joint replacement surgery, sports injuries, and spinal disorders with 12 years of practice.', true, true),
    ('Priya', 'Nair', 'priya.nair@medicalhospital.com', '+913456789012', 'Pediatrics', 'MBBS, MD (Pediatrics)', 8, 'MCI-PEDI-003', 'City Medical Center', 'Pediatrics', 'Mumbai', 500.00, 30, 'Dedicated pediatrician providing comprehensive child healthcare from newborns to adolescents.', true, true),
    ('Suresh', 'Patel', 'suresh.patel@medicalhospital.com', '+914567890123', 'Neurology', 'MBBS, MD (Medicine), DM (Neurology)', 20, 'MCI-NEUR-004', 'City Medical Center', 'Neurology', 'Mumbai', 900.00, 45, 'Experienced neurologist specializing in stroke, epilepsy, and movement disorders with over 20 years of practice.', true, true),
    ('Meera', 'Iyer', 'meera.iyer@medicalhospital.com', '+915678901234', 'Dermatology', 'MBBS, MD (Dermatology)', 10, 'MCI-DERM-005', 'City Medical Center', 'Dermatology', 'Mumbai', 600.00, 20, 'Dermatologist specializing in skin disorders, cosmetic dermatology, and hair treatments.', true, true);
