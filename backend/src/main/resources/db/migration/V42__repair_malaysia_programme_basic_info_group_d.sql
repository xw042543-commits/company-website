-- Basic-information corrections for Monash Malaysia, University of Nottingham Malaysia,
-- University of Southampton Malaysia, Universiti Utara Malaysia and City University Malaysia.
-- Sources were checked on 2026-10-14. This migration deliberately does not change programme
-- names, descriptions, career sections or curriculum sections.

CREATE TEMP TABLE group_d_verified_facts (
    university_slug VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    duration_months INTEGER,
    duration_display VARCHAR(100),
    tuition_myr NUMERIC(14, 2),
    tuition_fee_period VARCHAR(24),
    tuition_display VARCHAR(200),
    official_url VARCHAR(1000) NOT NULL,
    PRIMARY KEY (university_slug, name_en)
) ON COMMIT DROP;

-- Monash Malaysia 2026 fee tables. Amounts are international-student fees and exclude 6% SST.
INSERT INTO group_d_verified_facts VALUES
('monash','Bachelor of Arts and Social Sciences',36,'3年',49920,'PER_YEAR','2026国际学生学费 RM 49,920/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Digital Media and Communication',36,'3年',49920,'PER_YEAR','2026国际学生学费 RM 49,920/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Arts (Honours)',12,'1年',49920,'PER_YEAR','2026国际学生学费 RM 49,920/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Business and Commerce',36,'3年',51840,'PER_YEAR','2026国际学生学费 RM 51,840/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Digital Business',36,'3年',51840,'PER_YEAR','2026国际学生学费 RM 51,840/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Business and Commerce (Honours)',12,'1年',51840,'PER_YEAR','2026国际学生学费 RM 51,840/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Business and Commerce and Bachelor of Computer Science',48,'4年',54720,'PER_YEAR','2026国际学生学费 RM 54,720/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Business and Commerce and Bachelor of Digital Media and Communication',48,'4年',51840,'PER_YEAR','2026国际学生学费 RM 51,840/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Chemical Engineering (Honours)',48,'4年',64800,'PER_YEAR','2026国际学生学费 RM 64,800/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Civil Engineering (Honours)',48,'4年',64800,'PER_YEAR','2026国际学生学费 RM 64,800/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Electrical and Computer Systems Engineering (Honours)',48,'4年',64800,'PER_YEAR','2026国际学生学费 RM 64,800/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Materials Engineering (Honours)',48,'4年',64800,'PER_YEAR','2026国际学生学费 RM 64,800/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Mechanical Engineering (Honours)',48,'4年',64800,'PER_YEAR','2026国际学生学费 RM 64,800/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Robotics and Mechatronics Engineering (Honours)',48,'4年',64800,'PER_YEAR','2026国际学生学费 RM 64,800/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Software Engineering (Honours)',48,'4年',64800,'PER_YEAR','2026国际学生学费 RM 64,800/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Computer Science',36,'3年',54720,'PER_YEAR','2026国际学生学费 RM 54,720/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Computer Science in Data Science',36,'3年',54720,'PER_YEAR','2026国际学生学费 RM 54,720/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Computer Science (Honours)',12,'1年',54240,'PER_YEAR','2026国际学生学费 RM 54,240/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Medical Science and Doctor of Medicine',60,'5年',138720,'PER_YEAR','2026国际学生学费 RM 138,720/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Psychology',36,'3年',49920,'PER_YEAR','2026国际学生学费 RM 49,920/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Psychology and Business',36,'3年',51840,'PER_YEAR','2026国际学生学费 RM 51,840/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Human Nutrition',36,'3年',60480,'PER_YEAR','2026国际学生学费 RM 60,480/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Medical Science (Honours)',12,'1年',60000,'PER_YEAR','2026国际学生学费 RM 60,000/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Psychology (Honours)',12,'1年',51360,'PER_YEAR','2026国际学生学费 RM 51,360/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Pharmacy (Honours)',48,'4年',71040,'PER_YEAR','2026国际学生学费 RM 71,040/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Pharmaceutical Science',36,'3年',60480,'PER_YEAR','2026国际学生学费 RM 60,480/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Pharmaceutical Science (Honours)',12,'1年',58080,'PER_YEAR','2026国际学生学费 RM 58,080/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Applied Data Science',36,'3年',60480,'PER_YEAR','2026国际学生学费 RM 60,480/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Food Science and Technology',36,'3年',60480,'PER_YEAR','2026国际学生学费 RM 60,480/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Medical Bioscience',36,'3年',60480,'PER_YEAR','2026国际学生学费 RM 60,480/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Bachelor of Science (Honours)',12,'1年',60480,'PER_YEAR','2026国际学生学费 RM 60,480/年（另加6% SST）','https://www.monash.edu.my/study/undergraduate/fees'),
('monash','Postgraduate Diploma in Business and Commerce',12,'全日制1年（2学期）',48000,'PER_YEAR','2026国际学生学费 RM 48,000/年（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees'),
('monash','Master of International Business',24,'全日制1至2年（2至4学期）',74160,'TOTAL_PROGRAM','2026国际学生全课程学费 RM 74,160（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees'),
('monash','Master of Applied Engineering',12,'全日制1年（2学期）',65280,'TOTAL_PROGRAM','2026国际学生全课程学费 RM 65,280（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees'),
('monash','Master of Artificial Intelligence',24,'全日制1.5至2年（3至4学期）',74160,'TOTAL_PROGRAM','2026国际学生全课程学费 RM 74,160（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees'),
('monash','Master of Business Information Systems',24,'全日制1.5至2年（3至4学期）',74160,'TOTAL_PROGRAM','2026国际学生全课程学费 RM 74,160（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees'),
('monash','Master of Professional Counselling',24,'全日制2年（4学期）',83520,'TOTAL_PROGRAM','2026国际学生全课程学费 RM 83,520（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees'),
('monash','Master of Biomedical Science',24,'全日制2年（4学期）',54720,'PER_YEAR','2026国际学生学费 RM 54,720/年（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees'),
('monash','MASTER OF BIOTECHNOLOGY',24,'全日制2年（4学期）',54720,'PER_YEAR','2026国际学生学费 RM 54,720/年（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees'),
('monash','MASTER OF CLINICAL PSYCHOLOGY',24,'全日制2年（4学期）',89000,'TOTAL_PROGRAM','2026国际学生全课程学费 RM 89,000（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees'),
('monash','Master of Pharmaceutical Science',24,'全日制1至2年（2至4学期）',54720,'PER_YEAR','2026国际学生学费 RM 54,720/年（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees'),
('monash','Master of Science (Research)',24,'全日制2年（4学期）',54720,'PER_YEAR','2026国际学生学费 RM 54,720/年（另加6% SST）','https://www.monash.edu.my/study/postgraduate-and-research/fees');

-- Nottingham Malaysia latest published 2027 international-student annual fees.
INSERT INTO group_d_verified_facts
SELECT 'nottingham', v.name_en, CASE WHEN v.semesters=8 THEN 48 ELSE 36 END,
       CASE WHEN v.semesters=8 THEN '4年（全日制）' ELSE '3年（全日制）' END,
       v.fee, 'PER_YEAR', '2027国际学生学费 RM ' || to_char(v.fee,'FM999,999,990') || '/年（另加6% SST）',
       'https://www.nottingham.edu.my/study/undergraduate-courses/tuition-fees.aspx'
FROM (VALUES
('Applied Psychology and Management',6,57000),('BSc (Hons) Business Economics and Finance',6,59000),
('Finance, Accounting and Management',6,59000),('Finance, Management and Business Analytics',6,59000),
('BSc (Hons) International Business Management',6,59000),('Economics',6,57000),
('Economics and International Economics',6,57000),('Education (TESOL)',6,54000),('TESOL',8,54000),
('English Language and Literature',6,54000),('English with Creative Writing',6,54000),
('International Communication Studies',6,54000),
('International Communications Studies with English Language and Literature',6,54000),
('International Communications Studies with Film and Television Studies',6,54000),
('International Communications Studies with Performing Arts',6,54000),('International Relations',6,54000),
('International Relations with French',6,54000),('International Relations with Spanish',6,54000),
('Chemical Engineering',8,69000),('Chemical Engineering with Environmental Engineering',8,69000),
('Civil Engineering',8,69000),('Electrical and Electronic Engineering',8,69000),
('Mechatronic Engineering',8,69000),('Mechanical Engineering',8,69000),
('Biomedical Science',6,62000),('Biotechnology',6,62000),('Nutrition',6,62000),
('Computer Science',6,59000),('Computer Science with Artificial Intelligence',6,59000),
('Environmental Science',6,62000),('Mathematics and Data Science',6,62000),
('Pharmaceutical and Health Sciences',6,62000),('BPharm (Hons) Pharmacy',8,75000),
('Psychology',6,60000),('Psychology and Cognitive Neuroscience',6,60000)
) AS v(name_en,semesters,fee);

-- Southampton's current official Malaysia course directory.
INSERT INTO group_d_verified_facts
SELECT 'southampton', v.name_en, v.months, v.display, NULL, NULL, '国际学生学费待核实',
       'https://cdn.southampton.ac.uk/my/undergraduate/courses.page'
FROM (VALUES
('Bachelor of Science in Accounting and Finance',36,'3年'),
('Bachelor of Science in Business Analytics',36,'3年'),
('Bachelor of Science in Business Management',36,'3年'),
('Bachelor of Science in Computer Science',36,'3年'),
('Bachelor of Science in Economics and Actuarial Science',36,'3年'),
('Bachelor of Science in Finance and Financial Technology',36,'3年'),
('Master of Engineering in Mechanical Engineering',48,'4年'),
('Master of Engineering in Electrical and Electronic Engineering',48,'4年'),
('Master of Engineering in Aeronautics and Astronautics',48,'4年')
) AS v(name_en,months,display);

DO $$
DECLARE matched_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO matched_count
  FROM group_d_verified_facts f JOIN universities u ON u.slug=f.university_slug
  JOIN programmes p ON p.university_id=u.id AND UPPER(BTRIM(p.name_en))=UPPER(BTRIM(f.name_en))
  WHERE p.status='PUBLISHED';
  IF matched_count < 80 THEN
    RAISE EXCEPTION 'Expected at least 80 verified group-D programme matches, found %', matched_count;
  END IF;
END $$;

UPDATE programmes p SET
  duration_months=f.duration_months,
  duration_display=f.duration_display,
  tuition_min=CASE WHEN f.tuition_myr IS NULL THEN p.tuition_min ELSE f.tuition_myr END,
  tuition_max=CASE WHEN f.tuition_myr IS NULL THEN p.tuition_max ELSE f.tuition_myr END,
  tuition_currency=CASE WHEN f.tuition_myr IS NULL THEN p.tuition_currency ELSE 'MYR' END,
  tuition_fee_period=CASE WHEN f.tuition_fee_period IS NULL THEN p.tuition_fee_period ELSE f.tuition_fee_period END,
  tuition_display=CASE WHEN f.tuition_myr IS NULL THEN COALESCE(NULLIF(BTRIM(p.tuition_display),''),f.tuition_display) ELSE f.tuition_display END,
  official_url=f.official_url,
  source_checked_at=TIMESTAMPTZ '2026-10-14 00:00:00+08:00',
  updated_at=CURRENT_TIMESTAMP
FROM group_d_verified_facts f JOIN universities u ON u.slug=f.university_slug
WHERE p.university_id=u.id AND UPPER(BTRIM(p.name_en))=UPPER(BTRIM(f.name_en)) AND p.status='PUBLISHED';

-- The legacy imports stored semester counts as bare numbers for these universities.
UPDATE programmes p SET
  duration_months=(BTRIM(p.duration_display)::INTEGER)*6,
  duration_display=(BTRIM(p.duration_display)::INTEGER)*6 || '个月（' || BTRIM(p.duration_display) || '学期）',
  updated_at=CURRENT_TIMESTAMP
FROM universities u
WHERE p.university_id=u.id AND u.slug IN ('monash','nottingham','uum') AND p.status='PUBLISHED'
  AND BTRIM(p.duration_display) ~ '^[0-9]+$';

-- UUM legacy fees do not identify student category, applicable year or period. Preserve the
-- numeric value, but make the uncertainty explicit instead of presenting it as a verified fact.
UPDATE programmes p SET
  tuition_currency=COALESCE(p.tuition_currency,'MYR'),
  tuition_display='原记录 RM ' || to_char(COALESCE(p.tuition_min,p.tuition_max),'FM999,999,990') || '（学生类别、适用年份及计费周期待核实）',
  official_url='https://www.uum.edu.my/admissions/application-guidelines/undergraduate-international',
  source_checked_at=TIMESTAMPTZ '2026-10-14 00:00:00+08:00',
  updated_at=CURRENT_TIMESTAMP
FROM universities u
WHERE p.university_id=u.id AND u.slug='uum' AND p.status='PUBLISHED'
  AND COALESCE(p.tuition_min,p.tuition_max) IS NOT NULL;

-- City University current bachelor directory: verified duration, study mode and intakes.
CREATE TEMP TABLE city_bachelor_facts(name_key TEXT PRIMARY KEY, months INTEGER) ON COMMIT DROP;
INSERT INTO city_bachelor_facts VALUES
('bachelor of accounting (hons)',40),('bachelor of applied psychology (hons)',36),
('bachelor of biomedical sciences (hons)',48),('bachelor of business administration (hons)',36),
('bachelor of civil engineering with honors',48),('bachelor of communication (hons) corporate communication',36),
('bachelor of communication (hons) journalism',36),('bachelor of communication (hons) mass communication',36),
('bachelor of computer science (hons) software engineering',36),
('bachelor of education (early childhood education) honours',36),
('bachelor of engineering management (hons)',36),('bachelor of environmental health (hons)',48),
('bachelor of graphic design (hons)',36),('bachelor of information technology (hons)',36),
('bachelor of interior design (hons)',42),('bachelor of mechanical engineering with honors',48),
('bachelor of multimedia (hons)',36),('bachelor of nursing',48),
('bachelor of occupational safety & health (hons)',48),
('bachelor of science (hons) accounting & finance',36),
('bachelor of science (hons) architectural design',36);

UPDATE programmes p SET duration_months=f.months, duration_display=f.months || '个月',
  official_url='https://city.edu.my/programmes/bachelor/',
  source_checked_at=TIMESTAMPTZ '2026-10-14 00:00:00+08:00', updated_at=CURRENT_TIMESTAMP
FROM city_bachelor_facts f JOIN universities u ON u.slug='city'
WHERE p.university_id=u.id AND LOWER(BTRIM(p.name_en))=f.name_key AND p.status='PUBLISHED';

INSERT INTO programme_intakes(programme_id,intake_date,display_text,source_url,source_checked_at)
SELECT p.id,NULL,'1/2月、5/6月、9/10月', 'https://city.edu.my/programmes/bachelor/', TIMESTAMPTZ '2026-10-14 00:00:00+08:00'
FROM programmes p JOIN universities u ON u.id=p.university_id
WHERE u.slug='city' AND p.status='PUBLISHED' AND p.study_level_id=(SELECT id FROM study_levels WHERE code='BACHELOR')
  AND NOT EXISTS (SELECT 1 FROM programme_intakes i WHERE i.programme_id=p.id);

-- Add source-backed Chinese admissions notes where the previous record has no admissions section.
CREATE TEMP TABLE group_d_admissions_source(
  university_slug VARCHAR(200) PRIMARY KEY, body_zh TEXT NOT NULL, source_url VARCHAR(1000) NOT NULL
) ON COMMIT DROP;
INSERT INTO group_d_admissions_source VALUES
('monash','入学条件按专业及申请人所持学历分别审核；学术成绩、先修科目和英语要求须以该专业官网的当期要求为准。当前记录尚未完成逐专业条件核对，客观门槛暂标为待核实。','https://www.monash.edu.my/study/entry-requirements'),
('nottingham','入学条件按专业及申请人学历分别审核，部分专业另有指定科目要求。当前记录尚未完成逐专业条件核对，具体成绩、先修科目和英语门槛待核实，请以专业官网的当期要求为准。','https://www.nottingham.edu.my/Study/How-to-apply/Entry-requirements.aspx'),
('southampton','本科课程接受 A-Level、IB、STPM、UEC 等资格，不同专业的成绩及数学等指定科目要求不同；英语通常要求雅思总分 6.5、各单项不低于 6.0，或官网列出的同等资格。具体专业条件须以当期官网表格为准。','https://cdn.southampton.ac.uk/my/undergraduate/apply/entry_requirements.page'),
('uum','国际本科申请人须完成至少11至12年政府认可的中小学教育或持校方认可的同等资格，并满足对应专业的英语要求；申请本科还须具备数学及英语科目的合格成绩。各专业附加条件待核实。','https://www.uum.edu.my/admissions/application-guidelines/undergraduate-international'),
('city','入学条件因专业而异，通常要求完成受认可的预科、文凭或同等学历，部分专业有指定科目或专业标准。当前记录尚未完成逐专业门槛核对，具体要求待核实，请以专业官网为准。','https://city.edu.my/programmes/') ;

INSERT INTO programme_detail_sections(programme_id,section_type,title_zh,title_en,body_zh,body_en,sort_order,source_url,source_checked_at)
SELECT p.id,'ADMISSIONS','录取要求','Entry requirements',s.body_zh,NULL,20,s.source_url,TIMESTAMPTZ '2026-10-14 00:00:00+08:00'
FROM group_d_admissions_source s JOIN universities u ON u.slug=s.university_slug
JOIN programmes p ON p.university_id=u.id AND p.status='PUBLISHED'
WHERE NOT EXISTS (SELECT 1 FROM programme_detail_sections d WHERE d.programme_id=p.id AND d.section_type='ADMISSIONS');


