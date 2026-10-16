\pset pager off
BEGIN READ ONLY;
\echo 'PROGRAMME_CONTENT_AUDIT_SUMMARY'
WITH published AS (
    SELECT id FROM programmes WHERE status = 'PUBLISHED'
), sections AS (
    SELECT section.*
    FROM programme_detail_sections section
    JOIN published programme ON programme.id = section.programme_id
    WHERE section.section_type IN ('CAREER_OPPORTUNITIES', 'CURRICULUM')
      AND section.status = 'PUBLISHED'
), migration_start AS (
    SELECT MIN(installed_on) AS installed_on
    FROM flyway_schema_history
    WHERE version IN ('40', '41', '42', '43') AND success
)
SELECT
    (SELECT COUNT(*) FROM published) AS checked_programmes,
    COUNT(DISTINCT programme_id) FILTER (WHERE section_type = 'CAREER_OPPORTUNITIES') AS career_covered_programmes,
    COUNT(DISTINCT programme_id) FILTER (WHERE section_type = 'CURRICULUM') AS curriculum_covered_programmes,
    COUNT(DISTINCT programme_id) FILTER (WHERE source_type = 'official') AS official_programmes,
    COUNT(DISTINCT programme_id) FILTER (WHERE source_type = 'third_party') AS third_party_programmes,
    COUNT(DISTINCT programme_id) FILTER (WHERE source_type = 'ai_generated') AS ai_generated_programmes,
    COUNT(*) FILTER (WHERE updated_at >= (SELECT installed_on FROM migration_start)) AS repaired_sections
FROM sections;

\echo 'PROGRAMME_CONTENT_AUDIT_PARTITIONS'
SELECT MOD(programme.id, 4) AS partition,
       COUNT(DISTINCT programme.id) AS programmes,
       COUNT(DISTINCT section.programme_id) FILTER (WHERE section.section_type = 'CAREER_OPPORTUNITIES') AS careers,
       COUNT(DISTINCT section.programme_id) FILTER (WHERE section.section_type = 'CURRICULUM') AS curricula
FROM programmes programme
LEFT JOIN programme_detail_sections section
  ON section.programme_id = programme.id
 AND section.section_type IN ('CAREER_OPPORTUNITIES', 'CURRICULUM')
 AND section.status = 'PUBLISHED'
WHERE programme.status = 'PUBLISHED'
GROUP BY MOD(programme.id, 4)
ORDER BY partition;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM programmes programme
        WHERE programme.status = 'PUBLISHED'
          AND (
            NOT EXISTS (
                SELECT 1 FROM programme_detail_sections section
                WHERE section.programme_id = programme.id
                  AND section.section_type = 'CAREER_OPPORTUNITIES'
                  AND section.status = 'PUBLISHED'
                  AND NULLIF(BTRIM(section.body_zh), '') IS NOT NULL
                  AND section.source_type IN ('official', 'third_party', 'ai_generated')
            )
            OR NOT EXISTS (
                SELECT 1 FROM programme_detail_sections section
                WHERE section.programme_id = programme.id
                  AND section.section_type = 'CURRICULUM'
                  AND section.status = 'PUBLISHED'
                  AND COALESCE(NULLIF(BTRIM(section.body_zh), ''), NULLIF(BTRIM(section.body_en), '')) IS NOT NULL
                  AND section.source_type = 'official'
                  AND section.curriculum_review_status = 'VERIFIED'
                  AND jsonb_array_length(section.course_modules) > 0
            ) AND NOT EXISTS (
                SELECT 1 FROM programme_detail_sections section
                WHERE section.programme_id = programme.id
                  AND section.section_type = 'CURRICULUM'
                  AND (section.status = 'ARCHIVED' OR (section.status='PUBLISHED' AND section.body_zh LIKE '%【后台维护课程】%' AND jsonb_array_length(section.course_modules)=0))
                  AND section.curriculum_review_status = 'PENDING'
            )
          )
    ) THEN
        RAISE EXCEPTION 'Published programme career/curriculum coverage audit failed';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM programme_detail_sections section
        JOIN programmes programme ON programme.id = section.programme_id
        WHERE programme.status = 'PUBLISHED'
          AND section.status = 'PUBLISHED'
          AND section.section_type IN ('CAREER_OPPORTUNITIES', 'CURRICULUM')
          AND (
            (section.source_type IN ('official', 'third_party') AND NULLIF(BTRIM(section.source_url), '') IS NULL)
            OR (section.source_type = 'ai_generated' AND section.body_zh ~* '(employment rate|salary|就业率|保证就业|年薪|月薪)')
            OR (section.section_type = 'CURRICULUM' AND section.source_type = 'ai_generated'
                AND section.body_zh ~* '(entry requirements?|minimum (average|score|cgpa|grade)|ielts|toefl|muet|录取要求|学费)')
          )
    ) THEN
        RAISE EXCEPTION 'Published programme provenance or unsupported-claim audit failed';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM programme_detail_sections section
        JOIN programmes programme ON programme.id = section.programme_id
        JOIN study_levels study_level ON study_level.id = programme.study_level_id
        WHERE programme.status = 'PUBLISHED'
          AND section.status = 'PUBLISHED'
          AND section.source_type = 'ai_generated'
          AND (
            (section.section_type = 'CAREER_OPPORTUNITIES'
             AND study_level.code ~* 'FOUNDATION|PRE_UNIVERSITY|CERT'
             AND (section.body_zh NOT LIKE '%发展路径：%' OR section.body_zh LIKE '%具体就业岗位：%'))
            OR (section.section_type = 'CURRICULUM'
                AND study_level.code ~* 'FOUNDATION|PRE_UNIVERSITY|CERT'
                AND section.body_zh NOT LIKE '%学术英语与沟通%')
            OR (section.section_type = 'CURRICULUM'
                AND study_level.code ~* 'MASTER|POSTGRAD'
                AND section.body_zh NOT LIKE '%专业高级理论%')
            OR (section.section_type = 'CURRICULUM'
                AND study_level.code ~* 'PHD|DOCTOR'
                AND section.body_zh NOT LIKE '%博士研究与学位论文%')
          )
    ) THEN
        RAISE EXCEPTION 'AI programme content study-level alignment audit failed';
    END IF;
END $$;

\echo 'OFFICIAL_COURSE_MODULE_AUDIT'
SELECT COUNT(DISTINCT s.programme_id) AS verified_programmes,
       COALESCE(SUM(jsonb_array_length(s.course_modules)),0) AS official_course_associations
FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id
WHERE p.status='PUBLISHED' AND s.section_type='CURRICULUM' AND s.status='PUBLISHED'
  AND s.source_type='official' AND s.curriculum_review_status='VERIFIED';

DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id
   WHERE p.status='PUBLISHED' AND s.section_type='CURRICULUM' AND s.status='PUBLISHED'
   AND NOT (jsonb_array_length(s.course_modules)=0 AND s.curriculum_review_status='PENDING' AND s.body_zh LIKE '%【后台维护课程】%')
   AND (s.source_type IS DISTINCT FROM 'official' OR s.curriculum_review_status IS DISTINCT FROM 'VERIFIED'
        OR jsonb_array_length(s.course_modules)=0 OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(s.course_modules) m
          WHERE COALESCE(m->>'nameZh','') !~ '[一-鿿]' OR NULLIF(m->>'nameEn','') IS NULL
            OR COALESCE(m->>'sourceUrl','') NOT LIKE 'https://%' OR NULLIF(m->>'sourceCheckedAt','') IS NULL
            OR NULLIF(m->>'evidence','') IS NULL OR POSITION(m->>'nameEn' IN m->>'evidence')=0
            OR m->>'nameEn' ~* '(CGPA|IELTS|TOEFL|entry requirements|[0-9]+[[:space:]]*%)'
        ))) THEN RAISE EXCEPTION 'Invalid published official course modules'; END IF;
END $$;
SELECT COUNT(DISTINCT s.programme_id) AS pending_official_curriculum_programmes
FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id
WHERE p.status='PUBLISHED' AND s.section_type='CURRICULUM' AND s.curriculum_review_status='PENDING';
SELECT COUNT(*) AS preserved_curriculum_snapshots FROM programme_curriculum_backups;
SELECT COUNT(*) AS verified_programmes_with_explicit_campus
FROM programme_detail_sections s JOIN programmes p ON p.id=s.programme_id
WHERE p.status='PUBLISHED' AND s.section_type='CURRICULUM' AND s.status='PUBLISHED'
  AND s.curriculum_review_status='VERIFIED' AND NULLIF(BTRIM(p.campus),'') IS NOT NULL;
COMMIT;
