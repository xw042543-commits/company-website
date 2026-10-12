ALTER TABLE community_images ADD COLUMN post_id BIGINT REFERENCES community_posts(id);
ALTER TABLE community_images ADD COLUMN position INTEGER;
ALTER TABLE community_images ADD CONSTRAINT ck_image_binding CHECK ((post_id IS NULL AND position IS NULL) OR (post_id IS NOT NULL AND position BETWEEN 0 AND 8));
CREATE UNIQUE INDEX uq_community_image_position ON community_images(post_id,position) WHERE post_id IS NOT NULL;
CREATE TABLE community_image_post_review (
    post_id BIGINT PRIMARY KEY REFERENCES community_posts(id) ON DELETE CASCADE,
    text_passed BOOLEAN NOT NULL
);
