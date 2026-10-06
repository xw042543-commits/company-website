ALTER TABLE user_accounts
    DROP CONSTRAINT ck_user_accounts_contact;

ALTER TABLE user_accounts
    ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE user_accounts
    ADD CONSTRAINT ck_user_accounts_authentication_method CHECK (
        (password_hash IS NOT NULL AND (normalized_email IS NOT NULL OR normalized_phone IS NOT NULL))
        OR
        (password_hash IS NULL AND normalized_email IS NULL AND normalized_phone IS NULL)
    );
