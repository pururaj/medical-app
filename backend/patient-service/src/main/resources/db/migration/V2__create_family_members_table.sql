-- Family members linking table
-- Links a primary patient to their family members (who are also patients)
CREATE TABLE patient_family_members (
    id BIGSERIAL PRIMARY KEY,
    primary_patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    member_patient_id  BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    relationship       VARCHAR(50) NOT NULL CHECK (relationship IN (
                           'SPOUSE', 'CHILD', 'PARENT', 'SIBLING',
                           'GRANDPARENT', 'GRANDCHILD', 'OTHER')),
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_family_pair UNIQUE (primary_patient_id, member_patient_id),
    CONSTRAINT chk_no_self_link CHECK (primary_patient_id <> member_patient_id)
);

CREATE INDEX idx_family_primary ON patient_family_members(primary_patient_id);
CREATE INDEX idx_family_member  ON patient_family_members(member_patient_id);

COMMENT ON TABLE patient_family_members IS 'Links patients to their registered family members';
COMMENT ON COLUMN patient_family_members.relationship IS 'Relationship from primary patient perspective (e.g. CHILD means member is a child of primary)';
