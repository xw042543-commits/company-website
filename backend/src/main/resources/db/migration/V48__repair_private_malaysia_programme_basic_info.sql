-- Basic-information-only repair for the published programmes owned by task C.
-- Official source priority: UTAR 2026 international fee schedule, current SEGi and MAHSA programme pages.
-- Existing names, descriptions, career and curriculum content are intentionally untouched.

CREATE TEMP TABLE private_c_utar_facts (
    programme_code VARCHAR(64) PRIMARY KEY,
    duration_months INTEGER NOT NULL,
    duration_display VARCHAR(100) NOT NULL,
    tuition_min NUMERIC(14,2) NOT NULL,
    tuition_max NUMERIC(14,2) NOT NULL,
    tuition_display VARCHAR(500) NOT NULL
) ON COMMIT DROP;

INSERT INTO private_c_utar_facts(programme_code, duration_months, duration_display, tuition_min, tuition_max, tuition_display) VALUES
    ('UTAR_BACHELOR_002', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_003', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_004', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_005', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_006', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_007', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_008', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_009', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_010', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_011', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_012', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_013', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_014', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_015', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_016', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_017', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_018', '36', '3年', '58989', '63844', '国际学生全课程学费：MYR 58,989-63,844；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_019', '42', '3.5年', '62610', '62610', '国际学生全课程学费：MYR 62,610；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_020', '36', '3年', '57460', '61928', '国际学生全课程学费：MYR 57,460-61,928；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_021', '36', '3年', '57460', '61928', '国际学生全课程学费：MYR 57,460-61,928；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_022', '36', '3年', '57460', '61928', '国际学生全课程学费：MYR 57,460-61,928；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_023', '36', '3年', '57460', '61928', '国际学生全课程学费：MYR 57,460-61,928；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_024', '36', '3年', '57460', '61928', '国际学生全课程学费：MYR 57,460-61,928；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_025', '36', '3年', '57460', '61928', '国际学生全课程学费：MYR 57,460-61,928；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_026', '36', '3年', '57460', '61928', '国际学生全课程学费：MYR 57,460-61,928；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_027', '48', '4年', '57484', '57484', '国际学生全课程学费：MYR 57,484；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_028', '36', '3年', '61209', '61389', '国际学生全课程学费：MYR 61,209-61,389；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_029', '36', '3年', '61209', '61389', '国际学生全课程学费：MYR 61,209-61,389；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_030', '36', '3年', '61209', '61389', '国际学生全课程学费：MYR 61,209-61,389；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_031', '36', '3年', '61209', '61389', '国际学生全课程学费：MYR 61,209-61,389；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_032', '36', '3年', '61209', '61389', '国际学生全课程学费：MYR 61,209-61,389；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_033', '36', '3年', '61209', '61389', '国际学生全课程学费：MYR 61,209-61,389；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_034', '36', '3年', '61209', '61389', '国际学生全课程学费：MYR 61,209-61,389；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_035', '36', '3年', '61209', '61389', '国际学生全课程学费：MYR 61,209-61,389；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_036', '36', '3年', '61209', '61389', '国际学生全课程学费：MYR 61,209-61,389；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_037', '36', '3年', '65775', '66450', '国际学生全课程学费：MYR 65,775-66,450；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_038', '36', '3年', '65775', '66450', '国际学生全课程学费：MYR 65,775-66,450；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_039', '36', '3年', '65775', '66450', '国际学生全课程学费：MYR 65,775-66,450；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_040', '36', '3年', '65775', '66450', '国际学生全课程学费：MYR 65,775-66,450；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_041', '36', '3年', '65775', '66450', '国际学生全课程学费：MYR 65,775-66,450；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_042', '36', '3年', '65775', '66450', '国际学生全课程学费：MYR 65,775-66,450；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_043', '42', '3.5年', '65714', '77706', '国际学生全课程学费：MYR 65,714-77,706；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_044', '42', '3.5年', '65714', '77706', '国际学生全课程学费：MYR 65,714-77,706；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_045', '42', '3.5年', '65714', '77706', '国际学生全课程学费：MYR 65,714-77,706；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_046', '48', '4年', '81583', '81583', '国际学生全课程学费：MYR 81,583；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_047', '48', '4年', '92478', '92478', '国际学生全课程学费：MYR 92,478；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_048', '60', '5年', '121123', '121123', '国际学生全课程学费：MYR 121,123；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_049', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_050', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_051', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_052', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_053', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_054', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_055', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_056', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_057', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_058', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_059', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_060', '36', '3年', '61122', '63183', '国际学生全课程学费：MYR 61,122-63,183；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_061', '36', '3年', '62538', '66612', '国际学生全课程学费：MYR 62,538-66,612；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_062', '36', '3年', '62538', '66612', '国际学生全课程学费：MYR 62,538-66,612；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_063', '36', '3年', '62538', '66612', '国际学生全课程学费：MYR 62,538-66,612；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_064', '48', '4年', '73840', '74326', '国际学生全课程学费：MYR 73,840-74,326；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_065', '48', '4年', '73840', '74326', '国际学生全课程学费：MYR 73,840-74,326；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_066', '48', '4年', '73840', '74326', '国际学生全课程学费：MYR 73,840-74,326；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_067', '48', '4年', '73840', '74326', '国际学生全课程学费：MYR 73,840-74,326；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_068', '36', '3年', '60986', '63174', '国际学生全课程学费：MYR 60,986-63,174；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_069', '36', '3年', '60986', '63174', '国际学生全课程学费：MYR 60,986-63,174；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_070', '36', '3年', '60986', '63174', '国际学生全课程学费：MYR 60,986-63,174；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_071', '48', '4年', '73918', '74041', '国际学生全课程学费：MYR 73,918-74,041；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_072', '48', '4年', '73918', '74041', '国际学生全课程学费：MYR 73,918-74,041；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_073', '48', '4年', '73918', '74041', '国际学生全课程学费：MYR 73,918-74,041；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_074', '48', '4年', '73918', '74041', '国际学生全课程学费：MYR 73,918-74,041；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_075', '48', '4年', '73918', '74041', '国际学生全课程学费：MYR 73,918-74,041；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_076', '48', '4年', '73918', '74041', '国际学生全课程学费：MYR 73,918-74,041；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_077', '48', '4年', '73918', '74041', '国际学生全课程学费：MYR 73,918-74,041；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_078', '48', '4年', '73918', '74041', '国际学生全课程学费：MYR 73,918-74,041；不含学生签证申请费及 6% SST'),
    ('UTAR_BACHELOR_079', '48', '4年', '66735', '66735', '国际学生全课程学费：MYR 66,735；不含学生签证申请费及 6% SST');

DO $$
DECLARE
    published_count INTEGER;
    matched_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO published_count
    FROM programmes p JOIN universities u ON u.id = p.university_id
    WHERE u.slug = 'utar' AND p.status = 'PUBLISHED';
    SELECT COUNT(*) INTO matched_count
    FROM programmes p
    JOIN universities u ON u.id = p.university_id
    JOIN private_c_utar_facts f ON f.programme_code = p.programme_code
    WHERE u.slug = 'utar' AND p.status = 'PUBLISHED';
    IF published_count > 0 AND (published_count <> 79 OR matched_count <> 78) THEN
        RAISE EXCEPTION 'UTAR published/matched count changed: published %, matched %', published_count, matched_count;
    END IF;
END $$;

UPDATE programmes p
SET duration_months = f.duration_months,
    duration_display = f.duration_display,
    tuition_min = f.tuition_min,
    tuition_max = f.tuition_max,
    tuition_currency = 'MYR',
    tuition_display = f.tuition_display,
    tuition_fee_period = 'TOTAL_PROGRAM',
    official_url = 'https://study.utar.edu.my/documents/251120_UG_-_Oct_2025_Intake_Onwards_latest.pdf',
    source_checked_at = TIMESTAMPTZ '2026-10-14T00:00:00+08:00',
    updated_at = CURRENT_TIMESTAMP
FROM private_c_utar_facts f, universities u
WHERE p.programme_code = f.programme_code
  AND p.university_id = u.id
  AND u.slug = 'utar'
  AND p.status = 'PUBLISHED';

CREATE TEMP TABLE private_c_programme_repairs (
    university_slug VARCHAR(100) NOT NULL,
    programme_code VARCHAR(64) PRIMARY KEY,
    duration_months INTEGER,
    duration_display VARCHAR(100),
    tuition_display VARCHAR(500),
    official_url VARCHAR(1000)
) ON COMMIT DROP;

INSERT INTO private_c_programme_repairs VALUES
    ('segi', 'SEGI_BACHELOR_001', 36, '3年', '参考课程学费：MYR 54,975；适用学生类别及学年待核实', 'https://university.segi.edu.my/zh/course/bachelor-of-business-management-honours/'),
    ('segi', 'SEGI_MASTER_001', 12, '1年', '参考课程学费：MYR 54,350；适用学生类别及学年待核实', 'https://www.segi.edu.my/master-of-business-administration/'),
    ('segi', 'SEGI_MASTER_002', 12, '1年', '待核实：官网未公开可确认的国际学生课程学费', 'https://www.segi.edu.my/brochures/Postgraduate%20Studies.pdf'),
    ('mahsa', 'MAHSA_BACHELOR_001', 36, '3年', '参考课程学费：MYR 73,600；适用学生类别及学年待核实', 'https://www.mahsa.edu.my/faculties/Engineering/bachelor-information-technology.php'),
    ('mahsa', 'MAHSA_BACHELOR_002', NULL, '8学期（总学制待官网核实）', '参考课程学费：MYR 73,600；适用学生类别及学年待核实', NULL),
    ('mahsa', 'MAHSA_BACHELOR_003', NULL, '8学期（总学制待官网核实）', '参考课程学费：MYR 73,600；适用学生类别及学年待核实', NULL),
    ('mahsa', 'MAHSA_BACHELOR_004', NULL, '8学期（总学制待官网核实）', '参考课程学费：MYR 67,500；适用学生类别及学年待核实', NULL),
    ('help', 'HELP_MASTER_PDF_015', NULL, '3年（待官网核实）', NULL, NULL);

UPDATE programmes p
SET duration_months = r.duration_months,
    duration_display = r.duration_display,
    tuition_display = COALESCE(r.tuition_display, p.tuition_display),
    official_url = COALESCE(r.official_url, p.official_url),
    source_checked_at = CASE WHEN r.official_url IS NOT NULL THEN TIMESTAMPTZ '2026-10-14T00:00:00+08:00' ELSE p.source_checked_at END,
    updated_at = CURRENT_TIMESTAMP
FROM private_c_programme_repairs r, universities u
WHERE p.programme_code = r.programme_code
  AND p.university_id = u.id
  AND u.slug = r.university_slug
  AND p.status = 'PUBLISHED';

-- Preserve the reviewed amounts while making currency and the unresolved student category explicit.
UPDATE programmes p
SET tuition_display = CASE
        WHEN u.slug IN ('nilai', 'help') AND p.tuition_display NOT LIKE '%适用学生类别%'
            THEN p.tuition_display || '；币种：MYR；适用学生类别待核实'
        ELSE p.tuition_display
    END,
    updated_at = CURRENT_TIMESTAMP
FROM universities u
WHERE p.university_id = u.id
  AND u.slug IN ('nilai', 'help')
  AND p.status = 'PUBLISHED'
  AND p.tuition_display IS NOT NULL;

CREATE TEMP TABLE private_c_admissions (
    university_slug VARCHAR(100) NOT NULL,
    programme_code VARCHAR(64) PRIMARY KEY,
    body_zh TEXT NOT NULL,
    body_en TEXT NOT NULL,
    source_url VARCHAR(1000) NOT NULL
) ON COMMIT DROP;

INSERT INTO private_c_admissions VALUES
    ('segi', 'SEGI_BACHELOR_001',
     E'学术要求：STPM 任意两科至少 C（CGPA 2.00），并在 SPM 或同等学历阶段通过数学和英语；或 STAM 至少 Jayyid，并通过数学和英语；或 MQF 4/5 级文凭；或预科/基础课程 CGPA 至少 2.00。国际学生英语要求：IELTS 5.5 或同等成绩。最终录取以院校审核为准。',
     E'Academic entry: STPM with at least Grade C (CGPA 2.00) in two subjects plus passes in Mathematics and English at SPM level or equivalent; STAM with at least Jayyid plus Mathematics and English; an MQF Level 4/5 diploma; or foundation/matriculation with CGPA 2.00. International English requirement: IELTS 5.5 or equivalent. Final admission is subject to university assessment.',
     'https://university.segi.edu.my/zh/course/bachelor-of-business-management-honours/'),
    ('segi', 'SEGI_MASTER_001',
     E'学术要求：相关领域学士学位 CGPA 至少 2.75；CGPA 介于 2.50 至 2.75 的申请人可结合至少 5 年相关工作经验接受审核。国际学生英语要求：IELTS 6.0。最终录取以院校审核为准。',
     E'Academic entry: a bachelor degree in a related field with CGPA 2.75; applicants between CGPA 2.50 and 2.75 may be assessed with at least five years of relevant work experience. International English requirement: IELTS 6.0. Final admission is subject to university assessment.',
     'https://colleges.segi.edu.my/subangjaya/course/master-of-business-administration-general-management/'),
    ('segi', 'SEGI_MASTER_002',
     E'学术要求：学士学位 CGPA 至少 2.50。英语要求：IELTS 6.0。所有申请均由院校单独审核。',
     E'Academic entry: a bachelor degree with minimum CGPA 2.50. English requirement: IELTS 6.0. All applications are individually assessed.',
     'https://www.segi.edu.my/brochures/Postgraduate%20Studies.pdf'),
    ('mahsa', 'MAHSA_BACHELOR_001',
     E'学术要求包括：STPM 任意两科至少 C（CGPA 2.00）并达到 SPM 数学要求；或相关计算机/软件工程/信息技术/信息系统文凭 CGPA 至少 2.50（2.00 至 2.50 可接受严格内部审核）；其他同等资格按校方规定审核。英语要求：IELTS 5.0、TOEFL PBT 500、MUET Band 3 或同等成绩。最终录取以院校审核为准。',
     E'Academic entry includes STPM with at least Grade C (CGPA 2.00) in two subjects and the applicable SPM Mathematics requirement; or a relevant computing/software engineering/information technology/information systems diploma with CGPA 2.50 (CGPA 2.00 to 2.50 may undergo rigorous internal assessment). Other equivalents are assessed by the university. English: IELTS 5.0, TOEFL PBT 500, MUET Band 3 or equivalent. Final admission is subject to university assessment.',
     'https://www.mahsa.edu.my/faculties/Engineering/bachelor-information-technology.php');

INSERT INTO programme_detail_sections(
    programme_id, section_type, title_zh, title_en, body_zh, body_en,
    sort_order, source_url, source_checked_at, status
)
SELECT p.id, 'ADMISSIONS', '入学条件', 'Admission requirements', a.body_zh, a.body_en,
       10, a.source_url, TIMESTAMPTZ '2026-10-14T00:00:00+08:00', 'PUBLISHED'
FROM private_c_admissions a
JOIN universities u ON u.slug = a.university_slug
JOIN programmes p ON p.university_id = u.id AND p.programme_code = a.programme_code
WHERE p.status = 'PUBLISHED'
ON CONFLICT (programme_id, section_type) DO UPDATE
SET title_zh = EXCLUDED.title_zh,
    title_en = EXCLUDED.title_en,
    body_zh = EXCLUDED.body_zh,
    body_en = EXCLUDED.body_en,
    source_url = EXCLUDED.source_url,
    source_checked_at = EXCLUDED.source_checked_at,
    status = 'PUBLISHED',
    updated_at = CURRENT_TIMESTAMP;

DO $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM programmes p JOIN universities u ON u.id = p.university_id
    WHERE u.slug IN ('segi', 'utar', 'nilai', 'mahsa', 'help') AND p.status = 'PUBLISHED';
    IF total_count > 0 AND total_count <> 173 THEN
        RAISE EXCEPTION 'Task C scope changed: expected 173 published programmes, found %', total_count;
    END IF;
END $$;
