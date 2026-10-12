CREATE INDEX idx_community_posts_campus_category_latest
    ON community_posts (university_id, category, published_at DESC, id DESC) WHERE status = 'PUBLISHED';
CREATE INDEX idx_community_posts_category_latest
    ON community_posts (category, published_at DESC, id DESC) WHERE status = 'PUBLISHED';
CREATE INDEX idx_community_posts_campus_latest
    ON community_posts (university_id, published_at DESC, id DESC) WHERE status = 'PUBLISHED';
