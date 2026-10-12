ALTER TABLE community_posts
    ADD COLUMN title VARCHAR(60),
    ADD COLUMN category VARCHAR(30) NOT NULL DEFAULT 'GENERAL',
    ADD COLUMN university_id BIGINT REFERENCES universities(id),
    ADD CONSTRAINT ck_community_post_title CHECK (title IS NULL OR CHAR_LENGTH(title) BETWEEN 1 AND 60),
    ADD CONSTRAINT ck_community_post_category CHECK (category IN ('GENERAL','NEWCOMER','HOUSING','MARKETPLACE','STUDY','MEETUP'));
