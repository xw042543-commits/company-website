-- Publish only draft universities that already have at least one reviewed,
-- published programme. Draft programmes remain private.
WITH eligible_universities AS (
    SELECT university.id
    FROM universities AS university
    WHERE university.status = 'DRAFT'
      AND EXISTS (
          SELECT 1
          FROM programmes AS programme
          WHERE programme.university_id = university.id
            AND programme.status = 'PUBLISHED'
      )
), published_universities AS (
    UPDATE universities AS university
    SET status = 'PUBLISHED',
        published_at = COALESCE(university.published_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    FROM eligible_universities AS eligible
    WHERE university.id = eligible.id
    RETURNING university.id
)
INSERT INTO search_sync_jobs (
    university_id, status, attempt_count, available_at, created_at, updated_at
)
SELECT id, 'PENDING', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM published_universities;
