ALTER TABLE user_external_identities
    ADD COLUMN display_name VARCHAR(100),
    ADD COLUMN avatar_url VARCHAR(500);

ALTER TABLE user_external_identities
    ADD CONSTRAINT ck_user_external_identities_display_name
        CHECK (display_name IS NULL OR NULLIF(BTRIM(display_name), '') IS NOT NULL),
    ADD CONSTRAINT ck_user_external_identities_avatar_url
        CHECK (avatar_url IS NULL OR NULLIF(BTRIM(avatar_url), '') IS NOT NULL);
