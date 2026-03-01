CREATE TABLE IF NOT EXISTS staff_profiles (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(150) UNIQUE NOT NULL,
    phone_number   VARCHAR(20),
    department     VARCHAR(100),
    shift          VARCHAR(20)  NOT NULL DEFAULT 'MORNING',
    qualification  VARCHAR(300),
    license_number VARCHAR(100),
    joining_date   DATE,
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_user_id  ON staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_email    ON staff_profiles(email);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_active   ON staff_profiles(active);
