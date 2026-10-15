ALTER TABLE community_image_review_jobs
    ADD COLUMN direct_fallback BOOLEAN NOT NULL DEFAULT FALSE;
