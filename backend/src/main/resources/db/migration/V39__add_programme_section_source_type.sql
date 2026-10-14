-- Field-level provenance for programme career and curriculum content.
-- Existing URLs are classified as official only when their host matches the
-- programme or university official host; unverified URLs remain third-party.
ALTER TABLE programme_detail_sections
    ADD COLUMN source_type VARCHAR(20);

WITH classified AS (
    SELECT section.id,
           CASE
               WHEN section.source_url IS NULL THEN 'ai_generated'
               WHEN (
                   programme.official_url IS NOT NULL
                   AND LOWER(REGEXP_REPLACE(SPLIT_PART(section.source_url, '/', 3), '^www\.', '')) =
                       LOWER(REGEXP_REPLACE(SPLIT_PART(programme.official_url, '/', 3), '^www\.', ''))
               ) OR (
                   university.official_url IS NOT NULL
                   AND LOWER(REGEXP_REPLACE(SPLIT_PART(section.source_url, '/', 3), '^www\.', '')) =
                       LOWER(REGEXP_REPLACE(SPLIT_PART(university.official_url, '/', 3), '^www\.', ''))
               ) OR LOWER(SPLIT_PART(section.source_url, '/', 3)) ~ '(^|\.)(um\.edu\.my|taylors\.edu\.my)$'
                   THEN 'official'
               ELSE 'third_party'
           END AS source_type
    FROM programme_detail_sections section
    JOIN programmes programme ON programme.id = section.programme_id
    JOIN universities university ON university.id = programme.university_id
    WHERE section.section_type IN ('CAREER_OPPORTUNITIES', 'CAREER_OUTLOOK', 'CURRICULUM', 'COURSE_STRUCTURE')
)
UPDATE programme_detail_sections section
SET source_type = classified.source_type
FROM classified
WHERE classified.id = section.id;

ALTER TABLE programme_detail_sections
    ADD CONSTRAINT ck_programme_detail_sections_source_type
    CHECK (source_type IS NULL OR source_type IN ('official', 'third_party', 'ai_generated'));

CREATE INDEX idx_programme_detail_sections_source_type
    ON programme_detail_sections (section_type, source_type, status);
