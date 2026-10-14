-- Audit and repair shard 0 of the published programme catalogue.
-- Scope is intentionally stable: MOD(programmes.id, 4) = 0.
-- V39 adds programme_detail_sections.source_type.  This migration only edits
-- CAREER_OPPORTUNITIES and CURRICULUM rows owned by this shard.

CREATE TEMP TABLE programme_content_shard_0 ON COMMIT DROP AS
SELECT p.id AS programme_id,
       COALESCE(NULLIF(BTRIM(p.name_zh), ''), NULLIF(BTRIM(p.name_en), ''), p.programme_code) AS programme_name,
       COALESCE(NULLIF(BTRIM(c.name_zh), ''), NULLIF(BTRIM(c.name_en), ''), c.code) AS discipline_name,
       CASE
         WHEN sl.code ~* 'PHD|DOCTOR' THEN '研究、教学及高级专业岗位'
         WHEN sl.code ~* 'MASTER|POSTGRAD' THEN '高级专业岗位、项目管理及研究支持岗位'
         WHEN sl.code ~* 'DIPLOMA|FOUNDATION|CERT' THEN '初级专业支持、技术助理及项目执行岗位'
         ELSE '专业岗位、项目执行及分析支持岗位'
       END AS level_roles
FROM programmes p
JOIN subject_categories c ON c.id = p.subject_category_id
LEFT JOIN study_levels sl ON sl.id = p.study_level_id
WHERE p.status = 'PUBLISHED'
  AND MOD(p.id, 4) = 0;

-- A missing or unusable AI career section receives a conservative, programme-
-- specific overview.  It contains no salary, employment-rate or licensing claim.
INSERT INTO programme_detail_sections (
    programme_id, section_type, title_zh, title_en, body_zh, body_en,
    sort_order, source_url, source_checked_at, source_type, status,
    created_at, updated_at
)
SELECT target.programme_id,
       'CAREER_OPPORTUNITIES',
       '专业前景',
       'Career opportunities',
       '行业应用：' || target.programme_name || '所涉及的' || target.discipline_name ||
         E'知识可用于相关行业的业务分析、专业服务、项目实施与研究支持。\n\n' ||
       '具体就业岗位：可关注与' || target.programme_name || '直接相关的' || target.level_roles ||
         E'；具体岗位名称和准入条件以用人单位及当地法规为准。\n\n' ||
       '核心能力：建议重点建立专业理论、资料检索、分析判断、数字工具、沟通协作和项目实践能力。' ||
         E'\n\n深造方向：可结合个人兴趣继续学习' || target.discipline_name ||
         E'及相关交叉领域，或按职业要求准备受认可的专业资格。\n\n' ||
       '职业说明：以上为根据专业名称、学科分类和学历层次整理的一般发展参考，不是院校就业承诺；未引用就业率、薪资或未经核实的执业结论。',
       NULL,
       30, NULL, NULL, 'ai_generated', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM programme_content_shard_0 target
ON CONFLICT (programme_id, section_type) DO UPDATE
SET title_zh = EXCLUDED.title_zh,
    title_en = EXCLUDED.title_en,
    body_zh = EXCLUDED.body_zh,
    body_en = EXCLUDED.body_en,
    sort_order = EXCLUDED.sort_order,
    source_url = NULL,
    source_checked_at = NULL,
    source_type = 'ai_generated',
    status = 'PUBLISHED',
    updated_at = CURRENT_TIMESTAMP
WHERE programme_detail_sections.source_type = 'ai_generated'
  AND (
    NULLIF(BTRIM(programme_detail_sections.body_zh), '') IS NULL
    OR programme_detail_sections.body_zh !~ '行业应用[：:]'
    OR programme_detail_sections.body_zh !~ '具体就业岗位[：:]'
    OR programme_detail_sections.body_zh !~ '核心能力[：:]'
    OR programme_detail_sections.body_zh !~ '深造方向[：:]'
    OR programme_detail_sections.body_zh ~* '(salary|employment rate|就业率|保证就业|年薪|月薪)'
  );

-- Some official imports intentionally retained only the English career names.
-- Add a Chinese explanation while preserving the official English text verbatim
-- for checking.  The row remains sourced; no unverified translation is asserted.
UPDATE programme_detail_sections section
SET title_zh = '专业前景',
    body_zh = CASE section.source_type
      WHEN 'official' THEN
        '就业方向：学校官网列出了与' || target.programme_name || E'相关的职业方向。\n\n' ||
        '官网英文岗位名称：' || section.body_en || E'\n\n' ||
        '说明：以上英文岗位名称按官网原文保留，便于核对；岗位准入及发展要求以当地法规、专业认证和用人单位要求为准。'
      ELSE
        '就业方向：现有来源列出了与' || target.programme_name || E'相关的职业方向。\n\n' ||
        '来源英文岗位名称：' || section.body_en || E'\n\n' ||
        '说明：以上英文岗位名称按原始资料保留，便于核对；具体要求请以来源页面和用人单位说明为准。'
    END,
    updated_at = CURRENT_TIMESTAMP
FROM programme_content_shard_0 target
WHERE section.programme_id = target.programme_id
  AND section.section_type = 'CAREER_OPPORTUNITIES'
  AND section.source_type IN ('official', 'third_party')
  AND NULLIF(BTRIM(section.body_en), '') IS NOT NULL
  AND (NULLIF(BTRIM(section.body_zh), '') IS NULL OR section.body_zh !~ '[一-龥]');

-- V33 already produced discipline-specific AI careers for the catalogue.  V36
-- only archived unverified curricula, but this also safely republishes any valid
-- generated career that was subsequently hidden.
UPDATE programme_detail_sections section
SET title_zh = COALESCE(NULLIF(BTRIM(section.title_zh), ''), '专业前景'),
    title_en = COALESCE(NULLIF(BTRIM(section.title_en), ''), 'Career opportunities'),
    status = 'PUBLISHED',
    updated_at = CURRENT_TIMESTAMP
FROM programme_content_shard_0 target
WHERE section.programme_id = target.programme_id
  AND section.section_type = 'CAREER_OPPORTUNITIES'
  AND section.source_type = 'ai_generated'
  AND NULLIF(BTRIM(section.body_zh), '') IS NOT NULL
  AND section.body_zh ~ '行业应用[：:]'
  AND section.body_zh ~ '具体就业岗位[：:]'
  AND section.body_zh ~ '核心能力[：:]'
  AND section.body_zh ~ '深造方向[：:]';

-- Missing/unusable generated curricula receive learning-area descriptions only.
-- The bilingual labels are explicitly references, never asserted as official
-- module titles, credit values or compulsory/elective arrangements.
INSERT INTO programme_detail_sections (
    programme_id, section_type, title_zh, title_en, body_zh, body_en,
    sort_order, source_url, source_checked_at, source_type, status,
    created_at, updated_at
)
SELECT target.programme_id,
       'CURRICULUM',
       '专业课程',
       'Programme curriculum',
       E'参考学习领域，非官方课程表\n' ||
       '01|' || target.discipline_name || '导论|Introduction to the Field' || E'\n' ||
       '02|' || target.discipline_name || '基础理论|Foundations of the Discipline' || E'\n' ||
       '03|研究与资料分析方法|Research and Analytical Methods' || E'\n' ||
       '04|专业核心议题|Core Disciplinary Topics' || E'\n' ||
       '05|行业应用、伦理与规范|Industry Applications, Ethics and Standards' || E'\n' ||
       '06|综合实践或研究项目|Applied or Research Project' || E'\n' ||
       '说明：以上内容由 AI 根据专业名称、学科分类和学历层次整理，仅用于说明可能涉及的学习领域；不是院校官方课程名称、课程代码、学分、必修或选修安排，请以学校最新官方课程结构为准。',
       NULL,
       40, NULL, NULL, 'ai_generated', 'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM programme_content_shard_0 target
ON CONFLICT (programme_id, section_type) DO UPDATE
SET title_zh = EXCLUDED.title_zh,
    title_en = EXCLUDED.title_en,
    body_zh = EXCLUDED.body_zh,
    body_en = EXCLUDED.body_en,
    sort_order = EXCLUDED.sort_order,
    source_url = NULL,
    source_checked_at = NULL,
    source_type = 'ai_generated',
    status = 'PUBLISHED',
    updated_at = CURRENT_TIMESTAMP
WHERE programme_detail_sections.source_type = 'ai_generated'
  AND (
    NULLIF(BTRIM(programme_detail_sections.body_zh), '') IS NULL
    OR programme_detail_sections.body_zh NOT LIKE '参考学习领域，非官方课程表%'
    OR programme_detail_sections.body_zh !~ '(?m)^01[|][^|]+[|][^|]+$'
    OR programme_detail_sections.body_zh !~ '(?m)^06[|][^|]+[|][^|]+$'
    OR programme_detail_sections.body_zh ~* '(entry requirements?|minimum (average|score|cgpa|grade)|ielts|toefl|muet|学费|录取要求)'
  );

-- Restore the validated, discipline-specific V33 generated study areas that V36
-- archived solely because they deliberately had no official source URL.
UPDATE programme_detail_sections section
SET title_zh = COALESCE(NULLIF(BTRIM(section.title_zh), ''), '专业课程'),
    title_en = COALESCE(NULLIF(BTRIM(section.title_en), ''), 'Programme curriculum'),
    status = 'PUBLISHED',
    updated_at = CURRENT_TIMESTAMP
FROM programme_content_shard_0 target
WHERE section.programme_id = target.programme_id
  AND section.section_type = 'CURRICULUM'
  AND section.source_type = 'ai_generated'
  AND section.body_zh LIKE '参考学习领域，非官方课程表%'
  AND section.body_zh ~ '(?m)^01[|][^|]+[|][^|]+$'
  AND section.body_zh ~ '(?m)^06[|][^|]+[|][^|]+$';

-- Migration-time acceptance checks cover every published programme in this
-- shard and ensure official/third-party rows have not been downgraded.
DO $$
DECLARE
    published_count INTEGER;
    complete_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO published_count FROM programme_content_shard_0;

    SELECT COUNT(*) INTO complete_count
    FROM programme_content_shard_0 target
    WHERE EXISTS (
        SELECT 1 FROM programme_detail_sections section
        WHERE section.programme_id = target.programme_id
          AND section.section_type = 'CAREER_OPPORTUNITIES'
          AND section.status = 'PUBLISHED'
          AND NULLIF(BTRIM(section.body_zh), '') IS NOT NULL
          AND section.source_type IN ('official', 'third_party', 'ai_generated')
    )
      AND EXISTS (
        SELECT 1 FROM programme_detail_sections section
        WHERE section.programme_id = target.programme_id
          AND section.section_type = 'CURRICULUM'
          AND section.status = 'PUBLISHED'
          AND (NULLIF(BTRIM(section.body_zh), '') IS NOT NULL OR NULLIF(BTRIM(section.body_en), '') IS NOT NULL)
          AND section.source_type IN ('official', 'third_party', 'ai_generated')
          AND (
            section.source_type <> 'ai_generated'
            OR section.body_zh LIKE '参考学习领域，非官方课程表%'
          )
    );

    IF complete_count <> published_count THEN
        RAISE EXCEPTION 'Shard 0 content audit incomplete: % of % programmes passed', complete_count, published_count;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM programme_detail_sections section
        JOIN programme_content_shard_0 target ON target.programme_id = section.programme_id
        WHERE section.section_type IN ('CAREER_OPPORTUNITIES', 'CURRICULUM')
          AND section.source_type IN ('official', 'third_party')
          AND NULLIF(BTRIM(section.source_url), '') IS NULL
    ) THEN
        RAISE EXCEPTION 'Shard 0 contains sourced content without a source URL';
    END IF;
END $$;
