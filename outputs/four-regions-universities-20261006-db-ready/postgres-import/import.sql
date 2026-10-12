\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE stg_countries (
    code text, name_zh text, name_en text, continent_code text
) ON COMMIT DROP;

CREATE TEMP TABLE stg_universities (
    university_code text, name text, slug text, country text,
    name_zh text, name_en text, city_zh text, city_en text,
    country_code text, description_zh text, description_en text,
    popular text, status text
) ON COMMIT DROP;

\copy stg_countries FROM 'countries.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')
\copy stg_universities FROM 'universities.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')

DO $$
BEGIN
    IF (SELECT count(*) FROM stg_countries) <> 4 THEN
        RAISE EXCEPTION 'Expected 4 countries';
    END IF;
    IF (SELECT count(*) FROM stg_universities) <> 80 THEN
        RAISE EXCEPTION 'Expected 80 universities';
    END IF;
    IF EXISTS (SELECT 1 FROM stg_universities GROUP BY university_code HAVING count(*) > 1) THEN
        RAISE EXCEPTION 'Duplicate university_code in staging';
    END IF;
    IF EXISTS (SELECT 1 FROM stg_universities GROUP BY slug HAVING count(*) > 1) THEN
        RAISE EXCEPTION 'Duplicate slug in staging';
    END IF;
    IF EXISTS (
        SELECT 1 FROM stg_universities s
        LEFT JOIN stg_countries c ON c.code = s.country_code
        WHERE c.code IS NULL
    ) THEN
        RAISE EXCEPTION 'Missing staged country';
    END IF;
    IF EXISTS (
        SELECT 1 FROM stg_universities
        WHERE university_code !~ '^[A-Z][A-Z0-9_]{0,63}$'
           OR NULLIF(BTRIM(slug), '') IS NULL
           OR (NULLIF(BTRIM(name_zh), '') IS NULL AND NULLIF(BTRIM(name_en), '') IS NULL)
           OR status <> 'DRAFT'
    ) THEN
        RAISE EXCEPTION 'Invalid university staging values';
    END IF;
    IF EXISTS (
        SELECT 1 FROM stg_universities s
        JOIN universities u ON u.slug = s.slug
        WHERE u.university_code IS DISTINCT FROM s.university_code
    ) THEN
        RAISE EXCEPTION 'A staged slug belongs to another university_code';
    END IF;
END $$;

INSERT INTO countries (code, name_zh, name_en, continent_code)
SELECT code, NULLIF(name_zh, ''), NULLIF(name_en, ''), continent_code
FROM stg_countries
ON CONFLICT (code) DO UPDATE SET
    name_zh = EXCLUDED.name_zh,
    name_en = EXCLUDED.name_en,
    continent_code = EXCLUDED.continent_code,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO universities (
    university_code, name, slug, country, name_zh, name_en,
    city_zh, city_en, country_id, description_zh, description_en,
    popular, status
)
SELECT
    s.university_code, s.name, s.slug, s.country,
    NULLIF(s.name_zh, ''), NULLIF(s.name_en, ''),
    NULLIF(s.city_zh, ''), NULLIF(s.city_en, ''), c.id,
    NULLIF(s.description_zh, ''), NULLIF(s.description_en, ''),
    s.popular::boolean, s.status
FROM stg_universities s
JOIN countries c ON c.code = s.country_code
ON CONFLICT (university_code) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    country = EXCLUDED.country,
    name_zh = EXCLUDED.name_zh,
    name_en = EXCLUDED.name_en,
    city_zh = EXCLUDED.city_zh,
    city_en = EXCLUDED.city_en,
    country_id = EXCLUDED.country_id,
    description_zh = EXCLUDED.description_zh,
    description_en = EXCLUDED.description_en,
    popular = EXCLUDED.popular,
    status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF (
        SELECT count(*)
        FROM universities u
        JOIN stg_universities s USING (university_code)
    ) <> 80 THEN
        RAISE EXCEPTION 'University count mismatch after import';
    END IF;
END $$;

COMMIT;
