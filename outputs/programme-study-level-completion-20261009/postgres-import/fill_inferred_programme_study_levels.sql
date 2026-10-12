-- Fill missing programme study levels only when the programme title or
-- official URL contains a reliable level signal.
-- Ambiguous majors, professional certificates and short courses stay NULL.
-- Generated: 2026-10-09

BEGIN;

CREATE TEMP TABLE inferred_programme_levels ON COMMIT DROP AS
WITH candidates AS (
    SELECT
        p.id,
        p.university_id,
        COALESCE(p.name_en, '') || ' ' || COALESCE(p.name_zh, '') AS searchable_name,
        COALESCE(p.official_url, '') AS official_url
    FROM programmes p
    WHERE p.study_level_id IS NULL
), inferred AS (
    SELECT
        id,
        university_id,
        CASE
            WHEN searchable_name ~* '(^|[^a-z])(ph\.?d|dphil|edd|dba)([^a-z]|$)|doctor'
                THEN 'DOCTOR'
            WHEN searchable_name ~* 'bachelor|(^|[^a-z])(bsc|beng|ba|bfa|bba|bed|llb|mbbs|bcom|bs|mb|bchir)([^a-z]|$)'
                 OR searchable_name ~* 'double degree'
                THEN 'BACHELOR'
            WHEN searchable_name ~* 'master|(^|[^a-z])(mba|msc|msci|meng|mres|mph|mfa|mfin|med|llm|mphil|mphys|mmath)([^a-z]|$)'
                THEN 'MASTER'
            WHEN searchable_name ~* 'diploma'
                THEN 'DIPLOMA'
            WHEN searchable_name ~* 'foundation|university preparation program|pre-university|pre university'
                THEN 'FOUNDATION'
            WHEN official_url ~* '/undergraduate/|course-ug|/ug-'
                THEN 'BACHELOR'
            WHEN official_url ~* '/postgraduate/|course-pg|/pg-'
                THEN 'MASTER'
            ELSE NULL
        END AS level_code
    FROM candidates
)
SELECT id, university_id, level_code
FROM inferred
WHERE level_code IS NOT NULL;

UPDATE programmes p
SET study_level_id = level.id,
    updated_at = CURRENT_TIMESTAMP
FROM inferred_programme_levels inferred
JOIN study_levels level ON level.code = inferred.level_code
WHERE p.id = inferred.id
  AND p.study_level_id IS NULL;

INSERT INTO search_sync_jobs (university_id, status, available_at)
SELECT DISTINCT inferred.university_id, 'PENDING', CURRENT_TIMESTAMP
FROM inferred_programme_levels inferred
WHERE NOT EXISTS (
    SELECT 1
    FROM search_sync_jobs existing
    WHERE existing.university_id = inferred.university_id
      AND existing.status IN ('PENDING', 'PROCESSING')
);

SELECT level.code, COUNT(*) AS inferred_count
FROM inferred_programme_levels inferred
JOIN study_levels level ON level.code = inferred.level_code
GROUP BY level.code
ORDER BY level.code;

COMMIT;
