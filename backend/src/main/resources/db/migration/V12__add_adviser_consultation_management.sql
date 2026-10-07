ALTER TABLE user_accounts
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER',
    ADD CONSTRAINT ck_user_accounts_role CHECK (role IN ('USER', 'ADVISER'));

ALTER TABLE consultation_enquiries DROP CONSTRAINT ck_consultation_enquiries_status;
ALTER TABLE consultation_enquiries
    ADD CONSTRAINT ck_consultation_enquiries_status
        CHECK (status IN ('NEW', 'IN_PROGRESS', 'COMPLETED')),
    ADD COLUMN status_updated_at TIMESTAMPTZ,
    ADD COLUMN status_updated_by_user_id BIGINT,
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

UPDATE consultation_enquiries
SET status_updated_at = created_at
WHERE status_updated_at IS NULL;

ALTER TABLE consultation_enquiries
    ALTER COLUMN status_updated_at SET NOT NULL,
    ADD CONSTRAINT fk_consultation_status_updated_by
        FOREIGN KEY (status_updated_by_user_id) REFERENCES user_accounts(id) ON DELETE RESTRICT;

CREATE INDEX idx_consultation_enquiries_status_created
    ON consultation_enquiries (status, created_at DESC, id DESC);
