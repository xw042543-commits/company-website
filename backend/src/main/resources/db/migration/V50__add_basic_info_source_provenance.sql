ALTER TABLE programmes
    ADD COLUMN source_type VARCHAR(20),
    ADD COLUMN source_reference VARCHAR(1000);

ALTER TABLE programme_intakes
    ADD COLUMN source_type VARCHAR(20),
    ADD COLUMN source_reference VARCHAR(1000);

ALTER TABLE programme_detail_sections
    ADD COLUMN source_reference VARCHAR(1000);

ALTER TABLE programmes
    ADD CONSTRAINT ck_programmes_source_type
        CHECK (source_type IS NULL OR source_type IN ('official', 'third_party', 'ai_generated'));

ALTER TABLE programme_intakes
    ADD CONSTRAINT ck_programme_intakes_source_type
        CHECK (source_type IS NULL OR source_type IN ('official', 'third_party', 'ai_generated'));

-- The 20 Malaysian universities were audited on 2026-10-14. A non-empty
-- official_url is the institution source used by the import. Older imported
-- rows without a retained URL remain explicitly third-party/pending-source;
-- they are not represented as official facts.
UPDATE programmes p
SET source_type = CASE
        WHEN NULLIF(BTRIM(p.official_url), '') IS NOT NULL THEN 'official'
        ELSE 'third_party'
    END,
    source_reference = CASE
        WHEN NULLIF(BTRIM(p.official_url), '') IS NOT NULL THEN p.official_url
        ELSE '历史导入资料（原记录未保存具体来源，具体来源待核实）'
    END,
    source_checked_at = COALESCE(p.source_checked_at, TIMESTAMPTZ '2026-10-14 00:00:00+08:00')
FROM universities u
JOIN countries c ON c.id = u.country_id
WHERE u.id = p.university_id
  AND c.code = 'MY'
  AND u.status = 'PUBLISHED'
  AND p.status = 'PUBLISHED';

UPDATE programme_intakes i
SET source_type = CASE
        WHEN NULLIF(BTRIM(i.source_url), '') IS NOT NULL THEN 'official'
        ELSE 'third_party'
    END,
    source_reference = CASE
        WHEN NULLIF(BTRIM(i.source_url), '') IS NOT NULL THEN i.source_url
        ELSE '历史导入资料（原记录未保存具体来源，具体来源待核实）'
    END,
    source_checked_at = COALESCE(i.source_checked_at, TIMESTAMPTZ '2026-10-14 00:00:00+08:00')
FROM programmes p
JOIN universities u ON u.id = p.university_id
JOIN countries c ON c.id = u.country_id
WHERE p.id = i.programme_id
  AND c.code = 'MY'
  AND u.status = 'PUBLISHED'
  AND p.status = 'PUBLISHED';

-- Only admissions is basic-information scope. Career and curriculum sections
-- are intentionally untouched. A source-free section that merely tells users
-- the facts are pending verification is an explanatory AI note, not a fact.
UPDATE programme_detail_sections s
SET source_type = CASE
        WHEN NULLIF(BTRIM(s.source_url), '') IS NOT NULL THEN 'official'
        WHEN COALESCE(s.body_zh, '') LIKE '%待核实%'
          OR COALESCE(s.body_zh, '') LIKE '%请咨询%'
          OR COALESCE(s.body_zh, '') LIKE '%以院校%' THEN 'ai_generated'
        ELSE 'third_party'
    END,
    source_reference = CASE
        WHEN NULLIF(BTRIM(s.source_url), '') IS NOT NULL THEN s.source_url
        WHEN COALESCE(s.body_zh, '') LIKE '%待核实%'
          OR COALESCE(s.body_zh, '') LIKE '%请咨询%'
          OR COALESCE(s.body_zh, '') LIKE '%以院校%'
            THEN '解释性待核实说明（未生成学费、学制、门槛或日期等客观事实）'
        ELSE '历史导入资料（原记录未保存具体来源，具体来源待核实）'
    END,
    source_checked_at = COALESCE(s.source_checked_at, TIMESTAMPTZ '2026-10-14 00:00:00+08:00')
FROM programmes p
JOIN universities u ON u.id = p.university_id
JOIN countries c ON c.id = u.country_id
WHERE p.id = s.programme_id
  AND s.section_type = 'ADMISSIONS'
  AND c.code = 'MY'
  AND u.status = 'PUBLISHED'
  AND p.status = 'PUBLISHED';
