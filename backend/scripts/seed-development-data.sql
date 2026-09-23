-- 仅用于本地开发联调。所有专业、学费和入学时间都是演示数据。
-- 本文件不属于 Flyway 迁移，生产环境不会自动执行。

BEGIN;

INSERT INTO countries (code, name_zh, name_en, continent_code)
VALUES ('MY', '马来西亚', 'Malaysia', 'AS')
ON CONFLICT (code) DO UPDATE SET
    name_zh = EXCLUDED.name_zh,
    name_en = EXCLUDED.name_en,
    continent_code = EXCLUDED.continent_code,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO subject_categories (code, name_zh, name_en, sort_order, status)
VALUES
    ('COMPUTING', '计算机与信息技术', 'Computing and Information Technology', 10, 'PUBLISHED'),
    ('BUSINESS', '商科与管理', 'Business and Management', 20, 'PUBLISHED'),
    ('ENGINEERING', '工程', 'Engineering', 30, 'PUBLISHED')
ON CONFLICT (code) DO UPDATE SET
    name_zh = EXCLUDED.name_zh,
    name_en = EXCLUDED.name_en,
    sort_order = EXCLUDED.sort_order,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO study_levels (code, name_zh, name_en, sort_order, status)
VALUES
    ('BACHELOR', '本科', 'Bachelor''s', 10, 'PUBLISHED'),
    ('MASTER', '硕士', 'Master''s', 20, 'PUBLISHED')
ON CONFLICT (code) DO UPDATE SET
    name_zh = EXCLUDED.name_zh,
    name_en = EXCLUDED.name_en,
    sort_order = EXCLUDED.sort_order,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO course_modes (code, name_zh, name_en, sort_order, status)
VALUES
    ('ON_CAMPUS', '校内授课', 'On campus', 10, 'PUBLISHED'),
    ('ONLINE', '在线课程', 'Online', 20, 'PUBLISHED')
ON CONFLICT (code) DO UPDATE SET
    name_zh = EXCLUDED.name_zh,
    name_en = EXCLUDED.name_en,
    sort_order = EXCLUDED.sort_order,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO languages (code, name_zh, name_en, sort_order, status)
VALUES
    ('EN', '英语', 'English', 10, 'PUBLISHED'),
    ('MS', '马来语', 'Malay', 20, 'PUBLISHED')
ON CONFLICT (code) DO UPDATE SET
    name_zh = EXCLUDED.name_zh,
    name_en = EXCLUDED.name_en,
    sort_order = EXCLUDED.sort_order,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO universities (
    name, slug, country, popular, university_code,
    name_zh, name_en, city_zh, city_en,
    description_zh, description_en, country_id,
    status, updated_at, published_at
)
VALUES (
    'University of Malaya', 'university-of-malaya', 'Malaysia', TRUE, 'UM',
    '马来亚大学', 'University of Malaya', '吉隆坡', 'Kuala Lumpur',
    '本地开发演示资料，不作为正式院校介绍。',
    'Local development data only. This is not an official university profile.',
    (SELECT id FROM countries WHERE code = 'MY'),
    'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    country = EXCLUDED.country,
    popular = EXCLUDED.popular,
    university_code = EXCLUDED.university_code,
    name_zh = EXCLUDED.name_zh,
    name_en = EXCLUDED.name_en,
    city_zh = EXCLUDED.city_zh,
    city_en = EXCLUDED.city_en,
    description_zh = EXCLUDED.description_zh,
    description_en = EXCLUDED.description_en,
    country_id = EXCLUDED.country_id,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP,
    published_at = COALESCE(universities.published_at, CURRENT_TIMESTAMP);

INSERT INTO programmes (
    programme_code, university_id, subject_category_id, study_level_id, course_mode_id,
    slug, name_zh, name_en, description_zh, description_en,
    duration_months, duration_display,
    tuition_min, tuition_max, tuition_currency, tuition_display,
    tuition_rmb_min, tuition_rmb_max, exchange_rate, exchange_rate_date,
    tuition_fee_period, tuition_total_rmb_min, tuition_total_rmb_max,
    status, updated_at, published_at
)
VALUES
    (
        'DEV_UM_BSC_COMPUTER_SCIENCE',
        (SELECT id FROM universities WHERE slug = 'university-of-malaya'),
        (SELECT id FROM subject_categories WHERE code = 'COMPUTING'),
        (SELECT id FROM study_levels WHERE code = 'BACHELOR'),
        (SELECT id FROM course_modes WHERE code = 'ON_CAMPUS'),
        'dev-bachelor-computer-science', '计算机科学学士（演示）',
        'Bachelor of Computer Science (Demo)', '本地开发演示专业。',
        'Local development programme only.', 36, '3 years',
        70000, 90000, 'MYR', 'MYR 70,000–90,000 (demo)',
        115500, 148500, 1.65000000, DATE '2026-09-21',
        'TOTAL_PROGRAM', 115500, 148500,
        'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'DEV_UM_BBA_BUSINESS',
        (SELECT id FROM universities WHERE slug = 'university-of-malaya'),
        (SELECT id FROM subject_categories WHERE code = 'BUSINESS'),
        (SELECT id FROM study_levels WHERE code = 'BACHELOR'),
        (SELECT id FROM course_modes WHERE code = 'ON_CAMPUS'),
        'dev-bachelor-business-administration', '工商管理学士（演示）',
        'Bachelor of Business Administration (Demo)', '本地开发演示专业。',
        'Local development programme only.', 36, '3 years',
        65000, 85000, 'MYR', 'MYR 65,000–85,000 (demo)',
        107250, 140250, 1.65000000, DATE '2026-09-21',
        'TOTAL_PROGRAM', 107250, 140250,
        'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    ),
    (
        'DEV_UM_MENG_ENGINEERING',
        (SELECT id FROM universities WHERE slug = 'university-of-malaya'),
        (SELECT id FROM subject_categories WHERE code = 'ENGINEERING'),
        (SELECT id FROM study_levels WHERE code = 'MASTER'),
        (SELECT id FROM course_modes WHERE code = 'ON_CAMPUS'),
        'dev-master-engineering', '工程学硕士（演示）',
        'Master of Engineering (Demo)', '本地开发演示专业。',
        'Local development programme only.', 24, '2 years',
        50000, 70000, 'MYR', 'MYR 50,000–70,000 (demo)',
        82500, 115500, 1.65000000, DATE '2026-09-21',
        'TOTAL_PROGRAM', 82500, 115500,
        'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
ON CONFLICT (programme_code) DO UPDATE SET
    university_id = EXCLUDED.university_id,
    subject_category_id = EXCLUDED.subject_category_id,
    study_level_id = EXCLUDED.study_level_id,
    course_mode_id = EXCLUDED.course_mode_id,
    slug = EXCLUDED.slug,
    name_zh = EXCLUDED.name_zh,
    name_en = EXCLUDED.name_en,
    description_zh = EXCLUDED.description_zh,
    description_en = EXCLUDED.description_en,
    duration_months = EXCLUDED.duration_months,
    duration_display = EXCLUDED.duration_display,
    tuition_min = EXCLUDED.tuition_min,
    tuition_max = EXCLUDED.tuition_max,
    tuition_currency = EXCLUDED.tuition_currency,
    tuition_display = EXCLUDED.tuition_display,
    tuition_rmb_min = EXCLUDED.tuition_rmb_min,
    tuition_rmb_max = EXCLUDED.tuition_rmb_max,
    exchange_rate = EXCLUDED.exchange_rate,
    exchange_rate_date = EXCLUDED.exchange_rate_date,
    tuition_fee_period = EXCLUDED.tuition_fee_period,
    tuition_total_rmb_min = EXCLUDED.tuition_total_rmb_min,
    tuition_total_rmb_max = EXCLUDED.tuition_total_rmb_max,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP,
    published_at = COALESCE(programmes.published_at, CURRENT_TIMESTAMP);

INSERT INTO programme_languages (programme_id, language_id)
SELECT programme.id, language.id
FROM programmes programme
CROSS JOIN languages language
WHERE programme.programme_code IN (
    'DEV_UM_BSC_COMPUTER_SCIENCE',
    'DEV_UM_BBA_BUSINESS',
    'DEV_UM_MENG_ENGINEERING'
)
AND language.code = 'EN'
ON CONFLICT (programme_id, language_id) DO NOTHING;

INSERT INTO programme_intakes (programme_id, intake_date, display_text)
SELECT programme.id, intake.intake_date, intake.display_text
FROM programmes programme
CROSS JOIN (VALUES
    (DATE '2027-03-01', 'March 2027'),
    (DATE '2027-09-01', 'September 2027')
) AS intake(intake_date, display_text)
WHERE programme.programme_code IN (
    'DEV_UM_BSC_COMPUTER_SCIENCE',
    'DEV_UM_BBA_BUSINESS',
    'DEV_UM_MENG_ENGINEERING'
)
AND NOT EXISTS (
    SELECT 1
    FROM programme_intakes existing
    WHERE existing.programme_id = programme.id
      AND existing.intake_date = intake.intake_date
      AND existing.display_text = intake.display_text
);

INSERT INTO search_sync_jobs (university_id, status, available_at, created_at, updated_at)
SELECT university.id, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM universities university
WHERE university.slug = 'university-of-malaya'
  AND NOT EXISTS (
      SELECT 1
      FROM search_sync_jobs existing
      WHERE existing.university_id = university.id
        AND existing.status IN ('PENDING', 'PROCESSING')
  );

COMMIT;
