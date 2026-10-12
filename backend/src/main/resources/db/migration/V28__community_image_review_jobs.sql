CREATE TABLE community_image_review_jobs (
    image_id VARCHAR(32) PRIMARY KEY REFERENCES community_images(id) ON DELETE CASCADE,
    state VARCHAR(16) NOT NULL DEFAULT 'READY' CHECK(state IN ('READY','LEASED','WAITING','DONE')),
    attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 3),
    lease_token VARCHAR(36),
    available_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trace_id VARCHAR(128) UNIQUE
);
CREATE INDEX ix_community_image_jobs_due ON community_image_review_jobs(available_at) WHERE state<>'DONE';
CREATE TABLE community_image_callback_inbox (
    trace_id VARCHAR(128) PRIMARY KEY,
    verdict VARCHAR(16) NOT NULL CHECK(verdict IN ('PASS','REVIEW','REJECTED')),
    received_at TIMESTAMPTZ NOT NULL
);
INSERT INTO community_image_review_jobs(image_id)
SELECT id FROM community_images WHERE post_id IS NOT NULL AND status='PENDING';
