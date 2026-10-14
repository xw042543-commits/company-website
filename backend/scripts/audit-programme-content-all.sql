\pset pager off
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
                  AND section.source_type IN ('official', 'third_party', 'ai_generated')
                  AND (section.source_type <> 'ai_generated'
                       OR section.body_zh LIKE '参考学习领域，非官方课程表%')
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

SELECT 0 AS unresolved_programmes;
