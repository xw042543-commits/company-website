CREATE TABLE miniapp_account_avatars (
    user_account_id BIGINT PRIMARY KEY REFERENCES user_accounts(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL,
    content BYTEA NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_miniapp_account_avatar_type CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp')),
    CONSTRAINT ck_miniapp_account_avatar_size CHECK (octet_length(content) BETWEEN 1 AND 1048576)
);
