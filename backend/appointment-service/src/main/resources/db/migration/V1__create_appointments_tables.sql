-- Create appointments table
CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    patient_phone VARCHAR(20),
    patient_email VARCHAR(150),
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(200) NOT NULL,
    specialization VARCHAR(100),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    type VARCHAR(20) NOT NULL CHECK (type IN ('NEW_VISIT', 'FOLLOW_UP', 'EMERGENCY', 'TELEMEDICINE')),
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED')),
    reason_for_visit TEXT,
    symptoms TEXT,
    token_number INT,
    consultation_fee DECIMAL(10,2),
    checked_in_at TIMESTAMP,
    consultation_started_at TIMESTAMP,
    consultation_ended_at TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(100),
    cancelled_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100)
);

-- Create doctor_schedules table
CREATE TABLE doctor_schedules (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(200) NOT NULL,
    day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT NOT NULL DEFAULT 30,
    max_patients_per_slot INT DEFAULT 1,
    break_start_time TIME,
    break_end_time TIME,
    active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE,
    effective_until DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create doctor_leaves table
CREATE TABLE doctor_leaves (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    doctor_name VARCHAR(200) NOT NULL,
    leave_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    leave_type VARCHAR(20) NOT NULL DEFAULT 'CASUAL' CHECK (leave_type IN ('CASUAL', 'SICK', 'EMERGENCY', 'VACATION', 'CONFERENCE')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_patient_id ON appointments(patient_id);
CREATE INDEX idx_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointment_date ON appointments(appointment_date);
CREATE INDEX idx_status ON appointments(status);
CREATE INDEX idx_doctor_date_time ON appointments(doctor_id, appointment_date, appointment_time);

CREATE INDEX idx_schedule_doctor_id ON doctor_schedules(doctor_id);
CREATE INDEX idx_schedule_day_of_week ON doctor_schedules(day_of_week);
CREATE INDEX idx_schedule_active ON doctor_schedules(active);

CREATE INDEX idx_leave_doctor_date ON doctor_leaves(doctor_id, leave_date);

-- Comments for documentation
COMMENT ON TABLE appointments IS 'Stores patient appointment bookings and their status';
COMMENT ON TABLE doctor_schedules IS 'Defines doctor weekly availability schedules';
COMMENT ON TABLE doctor_leaves IS 'Tracks doctor leave/unavailability dates';

COMMENT ON COLUMN appointments.token_number IS 'Queue token number for the day';
COMMENT ON COLUMN appointments.status IS 'Current appointment status in the workflow';
COMMENT ON COLUMN doctor_schedules.slot_duration_minutes IS 'Duration of each appointment slot in minutes';
