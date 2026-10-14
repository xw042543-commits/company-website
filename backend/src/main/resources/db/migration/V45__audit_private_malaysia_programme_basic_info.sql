-- Basic-information audit and safe correction for the five assigned Malaysian universities.
-- Scope is restricted to PUBLISHED programmes belonging to taylor, ucsi, inti, sunway and apu.
-- Source precedence: official Taylor pages captured on 2026-10-14; then reviewed supplied
-- international-student brochures. Unknown units and periods remain explicitly unverified.
-- The current schema has source_url/source_checked_at but no source_type column; no duplicate
-- provenance column is introduced here.
CREATE TEMP TABLE official_taylor_programme_updates (
  programme_code varchar(64) PRIMARY KEY, name_en varchar(200), description_en text,
  duration_months integer, duration_display varchar(100), tuition_min numeric(14,2),
  tuition_max numeric(14,2), tuition_currency char(3), tuition_display varchar(200),
  official_url varchar(1000) NOT NULL, source_checked_at timestamptz NOT NULL
) ON COMMIT DROP;

INSERT INTO official_taylor_programme_updates VALUES
    ('TAYLOR_BACHELOR_026', 'Bachelor of Science (Honours) in Architecture', 'Learn from highly qualified practising architects and gain industry-focused skills to tackle global challenges through Taylor''s accredited architecture degree.', NULL, 'P3Y', 43845, 43845, 'USD', 'USD 43,845 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-in-architecture.html', '2026-10-14T05:58:43.847Z'),
    ('TAYLOR_BACHELOR_028', 'Bachelor of Quantity Surveying (Honours)', 'Develop a strong foundation in cost management in construction and measurement of building elements with Taylor''s accredited Bachelor of Quantity Surveying.', NULL, 'P3Y6M', 35259, 35259, 'USD', 'USD 35,259 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-quantity-surveying.html', '2026-10-14T05:58:47.859Z'),
    ('TAYLOR_BACHELOR_025', 'Bachelor of Science (Honours) in Sustainable Digital Construction Management', 'Become a construction professional that''s equipped with the knowledge and competencies aligned to the digital transformation within the built environment.', NULL, 'P3Y', 35199, 35199, 'USD', 'USD 35,199 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/architecture-building-and-design/undergraduate/bachelor-of-science-honours-in-sustainable-digital-construction-management.html', '2026-10-14T05:58:49.873Z'),
    ('TAYLOR_BACHELOR_032', 'Bachelor of Biomedical Science (Honours)', 'Get exposed to updates in the medicine, health sciences and biomedical science research fields with Taylor''s Bachelor of Biomedical Science (Honours).', NULL, 'P3Y6M', 45176, 45176, 'USD', 'USD 45,176 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biomedical-science.html', '2026-10-14T05:58:51.876Z'),
    ('TAYLOR_BACHELOR_030', 'Bachelor of Food Science (Honours)', 'Learn the science and technology of food processing, preservation and nutrition with Taylor''s Bachelor of Food Science enriched by strong industry partnerships.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-food-science.html', '2026-10-14T05:58:53.894Z'),
    ('TAYLOR_BACHELOR_031', 'Bachelor of Biotechnology (Honours)', 'Gain a comprehensive education & training in biotechnology focusing on agriculture, healthcare and industrial with Taylor''s Bachelor in Biotechnology.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/biosciences/undergraduate/bachelor-of-biotechnology.html', '2026-10-14T05:58:55.899Z'),
    ('TAYLOR_BACHELOR_020', 'Bachelor of Patisserie Arts (Honours)', 'Study Patisserie Arts through a degree that incorporates professional pastry and baking skills, techniques, and technology relevant to today’s industry.', NULL, 'P3Y', 37579, 37579, 'USD', 'USD 37,579 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-patisserie-arts.html', '2026-10-14T05:59:21.998Z'),
    ('TAYLOR_BACHELOR_019', 'Bachelor of Science (Honours) in Culinology', 'Strengthen R&D skills, master kitchen practices, and acquire real-life experience through a hands-on internship from Taylor''s immersive culinology programme.', NULL, 'P3Y', 41314, 41314, 'USD', 'USD 41,314 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-science-culinology.html', '2026-10-14T05:59:23.990Z'),
    ('TAYLOR_BACHELOR_016', 'Bachelor of Culinary Management (Honours)', 'Gain culinary expertise and take place as a leader in the global food and beverage industries with Taylor''s degree in culinary arts and food service management.', NULL, 'P3Y', 39356, 39356, 'USD', 'USD 39,356 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/taylors-culinary-institute/undergraduate/bachelor-of-culinary-management.html', '2026-10-14T05:59:26.008Z'),
    ('TAYLOR_BACHELOR_035', 'Bachelor of Mass Communication (Honours) in Advertising and Brand Management', 'Delve into the world of advertising creative strategy and brand management, gaining the expertise required to meet the challenging and growing market demands.', NULL, 'P3Y', 39748, 39748, 'USD', 'USD 39,748 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-in-advertising-and-brand-management.html', '2026-10-14T05:59:28.008Z'),
    ('TAYLOR_BACHELOR_037', 'Bachelor of Mass Communication (Honours) (Digital Media Production)', 'Gain first-hand experience in all aspects of production - including shooting, audio recording, editing, writing, directing and producing digital films.', NULL, 'P3Y', 39748, 39748, 'USD', 'USD 39,748 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/media-and-communication/undergraduate/bachelor-of-mass-communication-digital-media-production.html', '2026-10-14T05:59:30.451Z'),
    ('TAYLOR_BACHELOR_010', 'Bachelor of Computer Science (Honours)', 'Learn to design, develop, and maintain diverse computer applications with Taylor''s bachelor''s degree in Computer Science, Malaysia, blending science & practice.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-computer-science.html', '2026-10-14T05:59:38.048Z'),
    ('TAYLOR_BACHELOR_009', 'Bachelor of Software Engineering (Honours)', 'Taylor''s Bachelor of Software Engineering degree equips students with the skills and practical exposure to develop and maintain advanced systems and software.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-software-engineering.html', '2026-10-14T05:59:40.059Z'),
    ('TAYLOR_BACHELOR_011', 'Bachelor of Information Technology (Honours)', 'Taylor''s Bachelor of Information Technology teaches students to apply Internet technologies to solve real-world problems and improve organisational processes.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/computer-science/undergraduate/bachelor-of-information-technology.html', '2026-10-14T05:59:42.082Z'),
    ('TAYLOR_BACHELOR_014', 'Bachelor in Interactive Spatial Design (Honours)', 'Learn foundations of spatial design with interactive technology and smart automation for interior and exterior environments, through immersive experiences.', NULL, 'P3Y', 38392, 38392, 'USD', 'USD 38,392 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-in-interactive-spatial-design.html', '2026-10-14T05:59:44.071Z'),
    ('TAYLOR_BACHELOR_013', 'Bachelor of Fashion Design Technology (Honours)', 'Use the latest design technology & equipment in a course co-directed by the KL Fashion Week founder. Get exposure at Malaysia''s 1st co-working fashion studio.', NULL, 'P3Y', 38269, 38269, 'USD', 'USD 38,269 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-fashion-design-technology.html', '2026-10-14T05:59:46.080Z'),
    ('TAYLOR_BACHELOR_012', 'Bachelor of Design (Honours) in Creative Media', 'Study creative media with the option to specialise in Graphic Design, UI/UX, Digital Animation and Entertainment Design at a globally top-ranked design school.', NULL, 'P3Y', 40049, 40049, 'USD', 'USD 40,049 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/design/undergraduate/bachelor-of-design-in-creative-media.html', '2026-10-14T05:59:48.092Z'),
    ('TAYLOR_BACHELOR_040', 'Bachelor of Education (Honours)', 'Gain practical knowledge and skills to teach early childhood, primary school, special educational needs, and more with Taylor''s Bachelor of Education degree.', NULL, 'P3Y', 35158, 35158, 'USD', 'USD 35,158 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/education/undergraduate/bachelor-of-education.html', '2026-10-14T05:59:50.094Z'),
    ('TAYLOR_BACHELOR_022', 'Bachelor of Chemical Engineering (Honours)', 'Taylor’s Bachelor of Chemical Engineering programme is designed to offer students with a strong grasp of the theories and concepts of chemical engineering.', NULL, 'P4Y', 53930, 53930, 'USD', 'USD 53,930 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-chemical-engineering.html', '2026-10-14T05:59:52.556Z'),
    ('TAYLOR_BACHELOR_021', 'Bachelor of Electrical and Electronic Engineering with Honours', 'With Taylor’s Electrical & Electronic Engineering programme, you will gain a comprehensive understanding of electrical and electronic engineering principles.', NULL, 'P4Y', 53930, 53930, 'USD', 'USD 53,930 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-electrical-and-electronic-engineering.html', '2026-10-14T05:59:54.143Z'),
    ('TAYLOR_BACHELOR_023', 'Bachelor of Mechanical Engineering with Honours', 'Navigate challenges and design systems in automotive, power generation, aerospace, and manufacturing industries with Taylor''s mechanical engineering degree.', NULL, 'P4Y', 53930, 53930, 'USD', 'USD 53,930 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/engineering/undergraduate/bachelor-of-mechanical-engineering.html', '2026-10-14T05:59:56.650Z'),
    ('TAYLOR_BACHELOR_015', 'Bachelor of International Hospitality Management (Honours)', 'The Bachelor of International Hospitality Management programme will prepare our graduates for a successful future in the dynamic global hospitality industry.', NULL, 'P3Y', 39356, 39356, 'USD', 'USD 39,356 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-hospitality-management.html', '2026-10-14T06:00:00.157Z'),
    ('TAYLOR_BACHELOR_018', 'Bachelor of International Events Management (Honours)', 'Gear towards being a professional with a bachelor of event management. Gain managerial skills to lead the global event, tourism and recreation industries.', NULL, 'P3Y', 39356, 39356, 'USD', 'USD 39,356 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-events-management.html', '2026-10-14T06:00:02.162Z'),
    ('TAYLOR_BACHELOR_017', 'Bachelor of International Tourism Management (Honours)', 'Get a deeper understanding of international affairs, get exposed to emerging trends, and prepare to enter the dynamic industry with Taylor''s hospitality degree.', NULL, 'P3Y', 39356, 39356, 'USD', 'USD 39,356 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/hospitality-tourism-and-events/undergraduate/bachelor-of-international-tourism-management.html', '2026-10-14T06:00:04.176Z'),
    ('TAYLOR_BACHELOR_029', 'Bachelor of Laws (Honours)', 'Experience practical and realistic simulated court environments and learn Malaysian and English law fundamentals of legal systems through the bachelor of law.', 36, 'P3Y', 42911, 42911, 'USD', 'USD 42,911 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/law-and-governance/undergraduate/bachelor-of-laws.html', '2026-10-14T06:00:06.202Z'),
    ('TAYLOR_BACHELOR_043', 'Bachelor of Performing Arts (Honours)', 'Taylor''s, The Actors Studio, and industry experts bring you Malaysia''s 1st Performing Arts conservatory programme, with Performance, Music, and Dance tracks.', NULL, 'P3Y', 35319, 35319, 'USD', 'USD 35,319 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-performing-arts.html', '2026-10-14T06:00:12.191Z'),
    ('TAYLOR_BACHELOR_041', 'Bachelor of Psychology (Honours)', 'Through Taylor''s Bachelor of Psychology, learn from industry experts about sociology, philosophy, ethics, and more while enjoying global exposure opportunities.', NULL, 'P3Y', 36886, 36886, 'USD', 'USD 36,886 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/liberal-arts-and-sciences/undergraduate/bachelor-of-psychology.html', '2026-10-14T06:00:14.647Z'),
    ('TAYLOR_BACHELOR_034', 'Bachelor of Pharmacy (Honours)', 'Study a pharmacy degree in Malaysia at Taylor’s University and gain a strong foundation in pharmaceutical sciences and professional practice.', NULL, 'P4Y', 61758, 61758, 'USD', 'USD 61,758 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/pharmacy/undergraduate/bachelor-of-pharmacy.html', '2026-10-14T06:00:20.211Z'),
    ('TAYLOR_BACHELOR_033', 'Bachelor of Medicine, Bachelor of Surgery (MBBS)', 'Gain hands-on experience with patients in clinical and healthcare disciplines at Taylor''s Bachelor of Medicine and Bachelor of Surgery (MBBS) degree programme.', NULL, 'P5Y', 134937, 134937, 'USD', 'USD 134,937 (International)', 'https://university.taylors.edu.my/en/study/explore-all-programmes/medicine/undergraduate/bachelor-of-medicine-bachelor-of-surgery.html', '2026-10-14T06:00:24.248Z');


DO $$ BEGIN
  IF (SELECT COUNT(*) FROM official_taylor_programme_updates) <> 29 THEN
    RAISE EXCEPTION 'Unexpected Taylor official basic-information row count';
  END IF;
END $$;

-- Taylor: the earlier official import intentionally filled blanks only. Replace stale basic facts
-- for the exact 29 officially matched programmes, without touching names or descriptive content.
UPDATE programmes AS p
SET duration_months = CASE f.duration_display
        WHEN 'P3Y' THEN 36 WHEN 'P3Y6M' THEN 42 WHEN 'P4Y' THEN 48 WHEN 'P5Y' THEN 60
        ELSE p.duration_months END,
    duration_display = CASE f.duration_display
        WHEN 'P3Y' THEN '3年' WHEN 'P3Y6M' THEN '3年6个月' WHEN 'P4Y' THEN '4年'
        WHEN 'P5Y' THEN '5年' ELSE p.duration_display END,
    tuition_min = f.tuition_min,
    tuition_max = f.tuition_max,
    tuition_currency = f.tuition_currency,
    tuition_display = '国际学生学费：' || f.tuition_currency || ' ' ||
        TO_CHAR(f.tuition_min, 'FM999,999,999,990') || '（计费周期请以官网最新说明为准）',
    official_url = f.official_url,
    source_checked_at = f.source_checked_at,
    updated_at = CURRENT_TIMESTAMP
FROM official_taylor_programme_updates AS f, universities AS u
WHERE p.programme_code = f.programme_code
  AND p.university_id = u.id
  AND u.slug = 'taylor'
  AND p.status = 'PUBLISHED';

-- Sunway legacy rows stored an explicit USD display together with MYR in the structured currency.
-- The display and numeric magnitude both identify USD; correct only that deterministic mismatch.
UPDATE programmes AS p
SET tuition_currency = 'USD',
    tuition_display = REGEXP_REPLACE(p.tuition_display, '^USD\s*', '国际学生参考学费：USD '),
    updated_at = CURRENT_TIMESTAMP
FROM universities AS u
WHERE p.university_id = u.id
  AND u.slug = 'sunway'
  AND p.status = 'PUBLISHED'
  AND p.tuition_currency = 'MYR'
  AND p.tuition_display ~ '^USD\s*[0-9]';

-- Reviewed international-student sheets contained bare fee numbers. Preserve the amount and
-- currency, while making student category and the still-unconfirmed charging period explicit.
UPDATE programmes AS p
SET tuition_display = '国际学生参考学费：' || p.tuition_currency || ' ' ||
        REGEXP_REPLACE(BTRIM(p.tuition_display), '\.0+$', '') || '（计费周期待核实）',
    updated_at = CURRENT_TIMESTAMP
FROM universities AS u
WHERE p.university_id = u.id
  AND u.slug IN ('taylor', 'ucsi', 'inti', 'sunway', 'apu')
  AND p.status = 'PUBLISHED'
  AND p.tuition_currency IS NOT NULL
  AND BTRIM(p.tuition_display) ~ '^[0-9][0-9,]*(\.0+)?$';

-- APU facts came from the reviewed 2026 international-student brochure. V25 already established
-- the exact amount, currency, duration and exclusion of SST; add the omitted student category only.
UPDATE programmes AS p
SET tuition_display = '国际学生' || p.tuition_display,
    updated_at = CURRENT_TIMESTAMP
FROM universities AS u
WHERE p.university_id = u.id
  AND u.slug = 'apu'
  AND p.status = 'PUBLISHED'
  AND p.tuition_display LIKE '总学费 RM %';

-- A bare integer was previously rendered as if it were a duration. The supplied source did not
-- persist its unit. Keep the source value visible but explicitly unverified instead of guessing.
UPDATE programmes AS p
SET duration_display = '原始资料标注：' || BTRIM(p.duration_display) || '（单位待核实）',
    updated_at = CURRENT_TIMESTAMP
FROM universities AS u
WHERE p.university_id = u.id
  AND u.slug IN ('taylor', 'ucsi', 'inti', 'sunway', 'apu')
  AND p.status = 'PUBLISHED'
  AND BTRIM(p.duration_display) ~ '^[0-9]+$';

-- Direct migration writes must refresh the derived search documents.
INSERT INTO search_sync_jobs (university_id, status, attempt_count, available_at, created_at, updated_at)
SELECT u.id, 'PENDING', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM universities AS u
WHERE u.slug IN ('taylor', 'ucsi', 'inti', 'sunway', 'apu')
  AND u.status = 'PUBLISHED';

-- Guard against accidental changes outside the assigned five schools is provided by every UPDATE's
-- university slug predicate. Names, descriptions, career and curriculum columns are never updated.
