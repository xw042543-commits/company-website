\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE stg_countries (code text, name_zh text, name_en text, continent_code text) ON COMMIT DROP;
CREATE TEMP TABLE stg_categories (code text, name_zh text, name_en text, parent_code text, sort_order text, status text) ON COMMIT DROP;
CREATE TEMP TABLE stg_levels (code text, name_zh text, name_en text, sort_order text, status text) ON COMMIT DROP;
CREATE TEMP TABLE stg_modes (code text, name_zh text, name_en text, sort_order text, status text) ON COMMIT DROP;
CREATE TEMP TABLE stg_languages (code text, name_zh text, name_en text, sort_order text, status text) ON COMMIT DROP;
CREATE TEMP TABLE stg_universities (university_code text, name text, slug text, country text, name_zh text, name_en text, city_zh text, city_en text, country_code text, description_zh text, description_en text, popular text, status text) ON COMMIT DROP;
CREATE TEMP TABLE stg_programmes (programme_code text, university_code text, subject_category_code text, study_level_code text, course_mode_code text, slug text, name_zh text, name_en text, description_zh text, description_en text, duration_months text, duration_display text, tuition_min text, tuition_max text, tuition_currency text, tuition_display text, tuition_rmb_min text, tuition_rmb_max text, exchange_rate text, exchange_rate_date text, tuition_fee_period text, tuition_total_rmb_min text, tuition_total_rmb_max text, status text) ON COMMIT DROP;
CREATE TEMP TABLE stg_intakes (programme_code text, intake_date text, display_text text) ON COMMIT DROP;
CREATE TEMP TABLE stg_programme_languages (programme_code text, language_code text) ON COMMIT DROP;

\copy stg_countries FROM 'countries.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')
\copy stg_categories FROM 'subject_categories.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')
\copy stg_levels FROM 'study_levels.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')
\copy stg_modes FROM 'course_modes.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')
\copy stg_languages FROM 'languages.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')
\copy stg_universities FROM 'universities.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')
\copy stg_programmes FROM 'programmes.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')
\copy stg_intakes FROM 'programme_intakes.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')
\copy stg_programme_languages FROM 'programme_languages.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')

DO $$
BEGIN
  IF (SELECT count(*) FROM stg_universities) <> 20 THEN RAISE EXCEPTION 'Expected 20 universities'; END IF;
  IF (SELECT count(*) FROM stg_programmes) <> 2403 THEN RAISE EXCEPTION 'Expected 2403 programmes'; END IF;
  IF EXISTS (SELECT 1 FROM stg_programmes GROUP BY programme_code HAVING count(*) > 1) THEN RAISE EXCEPTION 'Duplicate programme_code in staging'; END IF;
  IF EXISTS (SELECT 1 FROM stg_programmes p LEFT JOIN stg_universities u USING (university_code) WHERE u.university_code IS NULL) THEN RAISE EXCEPTION 'Missing staged university'; END IF;
  IF EXISTS (SELECT 1 FROM stg_programmes p LEFT JOIN stg_categories c ON c.code=p.subject_category_code WHERE c.code IS NULL) THEN RAISE EXCEPTION 'Missing staged subject category'; END IF;
  IF EXISTS (SELECT 1 FROM stg_intakes i LEFT JOIN stg_programmes p USING (programme_code) WHERE p.programme_code IS NULL) THEN RAISE EXCEPTION 'Invalid intake reference'; END IF;
  IF EXISTS (SELECT 1 FROM stg_programme_languages l LEFT JOIN stg_programmes p USING (programme_code) WHERE p.programme_code IS NULL) THEN RAISE EXCEPTION 'Invalid language reference'; END IF;
END $$;

INSERT INTO countries (code, name_zh, name_en, continent_code)
SELECT code, NULLIF(name_zh,''), NULLIF(name_en,''), continent_code FROM stg_countries
ON CONFLICT (code) DO UPDATE SET name_zh=EXCLUDED.name_zh, name_en=EXCLUDED.name_en, continent_code=EXCLUDED.continent_code, updated_at=CURRENT_TIMESTAMP;

INSERT INTO subject_categories (code, name_zh, name_en, sort_order, status)
SELECT code, NULLIF(name_zh,''), NULLIF(name_en,''), sort_order::integer, status FROM stg_categories
ON CONFLICT (code) DO UPDATE SET name_zh=EXCLUDED.name_zh, name_en=EXCLUDED.name_en, sort_order=EXCLUDED.sort_order, status=EXCLUDED.status, updated_at=CURRENT_TIMESTAMP;
UPDATE subject_categories child SET parent_id=parent.id, updated_at=CURRENT_TIMESTAMP
FROM stg_categories source JOIN subject_categories parent ON parent.code=source.parent_code
WHERE child.code=source.code AND NULLIF(source.parent_code,'') IS NOT NULL;

INSERT INTO study_levels (code, name_zh, name_en, sort_order, status)
SELECT code, NULLIF(name_zh,''), NULLIF(name_en,''), sort_order::integer, status FROM stg_levels
ON CONFLICT (code) DO UPDATE SET name_zh=EXCLUDED.name_zh, name_en=EXCLUDED.name_en, sort_order=EXCLUDED.sort_order, status=EXCLUDED.status, updated_at=CURRENT_TIMESTAMP;

INSERT INTO course_modes (code, name_zh, name_en, sort_order, status)
SELECT code, NULLIF(name_zh,''), NULLIF(name_en,''), sort_order::integer, status FROM stg_modes
ON CONFLICT (code) DO UPDATE SET name_zh=EXCLUDED.name_zh, name_en=EXCLUDED.name_en, sort_order=EXCLUDED.sort_order, status=EXCLUDED.status, updated_at=CURRENT_TIMESTAMP;

INSERT INTO languages (code, name_zh, name_en, sort_order, status)
SELECT code, NULLIF(name_zh,''), NULLIF(name_en,''), sort_order::integer, status FROM stg_languages
ON CONFLICT (code) DO UPDATE SET name_zh=EXCLUDED.name_zh, name_en=EXCLUDED.name_en, sort_order=EXCLUDED.sort_order, status=EXCLUDED.status, updated_at=CURRENT_TIMESTAMP;

INSERT INTO universities (university_code, name, slug, country, name_zh, name_en, city_zh, city_en, country_id, description_zh, description_en, popular, status)
SELECT s.university_code, s.name, s.slug, s.country, NULLIF(s.name_zh,''), NULLIF(s.name_en,''), NULLIF(s.city_zh,''), NULLIF(s.city_en,''), c.id, NULLIF(s.description_zh,''), NULLIF(s.description_en,''), s.popular::boolean, s.status
FROM stg_universities s JOIN countries c ON c.code=s.country_code
ON CONFLICT (university_code) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, country=EXCLUDED.country, name_zh=EXCLUDED.name_zh, name_en=EXCLUDED.name_en, city_zh=EXCLUDED.city_zh, city_en=EXCLUDED.city_en, country_id=EXCLUDED.country_id, description_zh=EXCLUDED.description_zh, description_en=EXCLUDED.description_en, popular=EXCLUDED.popular, status=EXCLUDED.status, updated_at=CURRENT_TIMESTAMP;

INSERT INTO programmes (programme_code, university_id, subject_category_id, study_level_id, course_mode_id, slug, name_zh, name_en, description_zh, description_en, duration_months, duration_display, tuition_min, tuition_max, tuition_currency, tuition_display, tuition_rmb_min, tuition_rmb_max, exchange_rate, exchange_rate_date, tuition_fee_period, tuition_total_rmb_min, tuition_total_rmb_max, status)
SELECT s.programme_code, u.id, c.id, sl.id, cm.id, s.slug, NULLIF(s.name_zh,''), NULLIF(s.name_en,''), NULLIF(s.description_zh,''), NULLIF(s.description_en,''), NULLIF(s.duration_months,'')::integer, NULLIF(s.duration_display,''), NULLIF(s.tuition_min,'')::numeric(14,2), NULLIF(s.tuition_max,'')::numeric(14,2), NULLIF(s.tuition_currency,''), NULLIF(s.tuition_display,''), NULLIF(s.tuition_rmb_min,'')::numeric(14,2), NULLIF(s.tuition_rmb_max,'')::numeric(14,2), NULLIF(s.exchange_rate,'')::numeric(18,8), NULLIF(s.exchange_rate_date,'')::date, CASE s.tuition_fee_period WHEN 'TOTAL' THEN 'TOTAL_PROGRAM' ELSE s.tuition_fee_period END, NULLIF(s.tuition_total_rmb_min,'')::numeric(14,2), NULLIF(s.tuition_total_rmb_max,'')::numeric(14,2), s.status
FROM stg_programmes s
JOIN universities u ON u.university_code=s.university_code
JOIN subject_categories c ON c.code=s.subject_category_code
LEFT JOIN study_levels sl ON sl.code=NULLIF(s.study_level_code,'')
LEFT JOIN course_modes cm ON cm.code=NULLIF(s.course_mode_code,'')
ON CONFLICT (programme_code) DO UPDATE SET university_id=EXCLUDED.university_id, subject_category_id=EXCLUDED.subject_category_id, study_level_id=EXCLUDED.study_level_id, course_mode_id=EXCLUDED.course_mode_id, slug=EXCLUDED.slug, name_zh=EXCLUDED.name_zh, name_en=EXCLUDED.name_en, description_zh=EXCLUDED.description_zh, description_en=EXCLUDED.description_en, duration_months=EXCLUDED.duration_months, duration_display=EXCLUDED.duration_display, tuition_min=EXCLUDED.tuition_min, tuition_max=EXCLUDED.tuition_max, tuition_currency=EXCLUDED.tuition_currency, tuition_display=EXCLUDED.tuition_display, tuition_rmb_min=EXCLUDED.tuition_rmb_min, tuition_rmb_max=EXCLUDED.tuition_rmb_max, exchange_rate=EXCLUDED.exchange_rate, exchange_rate_date=EXCLUDED.exchange_rate_date, tuition_fee_period=EXCLUDED.tuition_fee_period, tuition_total_rmb_min=EXCLUDED.tuition_total_rmb_min, tuition_total_rmb_max=EXCLUDED.tuition_total_rmb_max, status=EXCLUDED.status, updated_at=CURRENT_TIMESTAMP;

DELETE FROM programme_languages pl USING programmes p, stg_programmes s WHERE pl.programme_id=p.id AND p.programme_code=s.programme_code;
INSERT INTO programme_languages (programme_id, language_id)
SELECT p.id, l.id FROM stg_programme_languages s JOIN programmes p ON p.programme_code=s.programme_code JOIN languages l ON l.code=s.language_code;

DELETE FROM programme_intakes pi USING programmes p, stg_programmes s WHERE pi.programme_id=p.id AND p.programme_code=s.programme_code;
INSERT INTO programme_intakes (programme_id, intake_date, display_text)
SELECT p.id, NULLIF(s.intake_date,'')::date, s.display_text FROM stg_intakes s JOIN programmes p ON p.programme_code=s.programme_code;

DO $$
BEGIN
  IF (SELECT count(*) FROM programmes p JOIN stg_programmes s USING (programme_code)) <> 2403 THEN RAISE EXCEPTION 'Programme count mismatch after import'; END IF;
  IF (SELECT count(*) FROM programme_languages pl JOIN programmes p ON p.id=pl.programme_id JOIN stg_programmes s USING (programme_code)) <> 2403 THEN RAISE EXCEPTION 'Language relation count mismatch after import'; END IF;
  IF (SELECT count(*) FROM programme_intakes pi JOIN programmes p ON p.id=pi.programme_id JOIN stg_programmes s USING (programme_code)) <> 2408 THEN RAISE EXCEPTION 'Intake count mismatch after import'; END IF;
END $$;

COMMIT;
