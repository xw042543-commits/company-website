ALTER TABLE user_accounts DROP CONSTRAINT ck_user_accounts_role;
ALTER TABLE user_accounts
    ADD CONSTRAINT ck_user_accounts_role CHECK (role IN ('USER', 'ADVISER', 'ADMIN'));

ALTER TABLE universities
    ADD COLUMN official_url VARCHAR(1000);

CREATE INDEX idx_universities_admin_status_name
    ON universities (status, name);
CREATE INDEX idx_programmes_admin_status_university
    ON programmes (status, university_id);
