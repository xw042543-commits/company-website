CREATE TABLE community_images (
    id VARCHAR(32) PRIMARY KEY,
    owner_account_id BIGINT NOT NULL REFERENCES user_accounts(id),
    storage_key VARCHAR(32) NOT NULL UNIQUE,
    width INTEGER NOT NULL CHECK (width > 0),
    height INTEGER NOT NULL CHECK (height > 0),
    byte_size BIGINT NOT NULL CHECK (byte_size > 0),
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PASS','REVIEW','REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_community_images_owner_created ON community_images(owner_account_id,created_at);
CREATE TABLE community_image_capacity (
    id INTEGER PRIMARY KEY CHECK (id=1),
    used_bytes BIGINT NOT NULL CHECK (used_bytes>=0)
);
INSERT INTO community_image_capacity(id,used_bytes) VALUES(1,0);
