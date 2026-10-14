-- Read-only production verification for MOD(programmes.id, 4) = 1.
WITH target AS (
    SELECT p.id
    FROM programmes p
    WHERE p.status = 'PUBLISHED' AND MOD(p.id, 4) = 1
), sections AS (
    SELECT s.*
    FROM programme_detail_sections s
    JOIN target t ON t.id = s.programme_id
    WHERE s.section_type IN ('CAREER_OPPORTUNITIES', 'CURRICULUM')
)
SELECT
    (SELECT COUNT(*) FROM target) AS published_programmes,
    COUNT(*) FILTER (WHERE section_type = 'CAREER_OPPORTUNITIES' AND status = 'PUBLISHED') AS published_careers,
    COUNT(*) FILTER (WHERE section_type = 'CURRICULUM' AND status = 'PUBLISHED') AS published_curricula,
    COUNT(*) FILTER (WHERE source_type = 'official' AND status = 'PUBLISHED') AS official_sections,
    COUNT(*) FILTER (WHERE source_type = 'third_party' AND status = 'PUBLISHED') AS third_party_sections,
    COUNT(*) FILTER (WHERE source_type = 'ai_generated' AND status = 'PUBLISHED') AS ai_generated_sections
FROM sections;

WITH target AS (
    SELECT p.id, p.programme_code, COALESCE(p.name_zh, p.name_en) AS programme_name
    FROM programmes p
    WHERE p.status = 'PUBLISHED' AND MOD(p.id, 4) = 1
)
SELECT target.programme_code, target.programme_name,
       BOOL_OR(section.section_type = 'CAREER_OPPORTUNITIES' AND section.status = 'PUBLISHED'
               AND NULLIF(BTRIM(section.body_zh), '') IS NOT NULL) AS career_ok,
       BOOL_OR(section.section_type = 'CURRICULUM' AND section.status = 'PUBLISHED'
               AND (NULLIF(BTRIM(section.body_zh), '') IS NOT NULL
                    OR NULLIF(BTRIM(section.body_en), '') IS NOT NULL)) AS curriculum_ok
FROM target
LEFT JOIN programme_detail_sections section
  ON section.programme_id = target.id
 AND section.section_type IN ('CAREER_OPPORTUNITIES', 'CURRICULUM')
GROUP BY target.id, target.programme_code, target.programme_name
HAVING NOT (
    BOOL_OR(section.section_type = 'CAREER_OPPORTUNITIES' AND section.status = 'PUBLISHED'
            AND NULLIF(BTRIM(section.body_zh), '') IS NOT NULL)
    AND BOOL_OR(section.section_type = 'CURRICULUM' AND section.status = 'PUBLISHED'
                AND (NULLIF(BTRIM(section.body_zh), '') IS NOT NULL
                     OR NULLIF(BTRIM(section.body_en), '') IS NOT NULL))
)
ORDER BY target.programme_code;

-- The result must be empty. It catches unsupported claims and common admissions
-- contamination without treating retained official English names/codes as errors.
SELECT p.programme_code, s.section_type, s.source_type
FROM programme_detail_sections s
JOIN programmes p ON p.id = s.programme_id
WHERE p.status = 'PUBLISHED'
  AND MOD(p.id, 4) = 1
  AND s.section_type IN ('CAREER_OPPORTUNITIES', 'CURRICULUM')
  AND s.status = 'PUBLISHED'
  AND (
    (s.source_type = 'ai_generated' AND s.body_zh ~* '(employment rate|salary|就业率|保证就业|年薪|月薪)')
    OR (s.section_type = 'CURRICULUM' AND COALESCE(s.body_en, s.body_zh, '') ~*
        '(entry requirements?|minimum (average|score|cgpa|grade)|ielts|toefl|muet|录取要求|学费)')
    OR (s.source_type IN ('official', 'third_party') AND NULLIF(BTRIM(s.source_url), '') IS NULL)
  );
