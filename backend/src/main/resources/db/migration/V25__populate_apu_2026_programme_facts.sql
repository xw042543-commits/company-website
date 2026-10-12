-- Verified against the supplied 2026 APU international-student brochure, pages 5-6.
-- Fees exclude the Malaysian government's 6% SST, as stated in the source.
CREATE TEMP TABLE apu_2026_programme_facts (
    programme_code VARCHAR(64) PRIMARY KEY,
    duration_months INTEGER,
    duration_display VARCHAR(100),
    tuition_myr NUMERIC(14, 2) NOT NULL,
    tuition_display VARCHAR(200) NOT NULL,
    tuition_fee_period VARCHAR(24) NOT NULL
) ON COMMIT DROP;

INSERT INTO apu_2026_programme_facts (
    programme_code, duration_months, duration_display, tuition_myr, tuition_display, tuition_fee_period
) VALUES
    ('APU_BACHELOR_PDF_001', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_002', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_003', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_004', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_005', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_006', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_007', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_008', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_009', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_010', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_011', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_012', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_013', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_014', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_015', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_016', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_017', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_018', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_019', 48, '4年', 137200, '总学费 RM 137,200（4年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_020', 48, '4年', 137200, '总学费 RM 137,200（4年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_021', 48, '4年', 137200, '总学费 RM 137,200（4年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_022', 48, '4年', 137200, '总学费 RM 137,200（4年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_023', 48, '4年', 137200, '总学费 RM 137,200（4年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_024', 36, '3年', 110400, '总学费 RM 110,400（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_025', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_026', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_027', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_028', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_029', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_BACHELOR_PDF_030', 36, '3年', 108500, '总学费 RM 108,500（3年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DIPLOMA_PDF_001', 24, '2年', 54200, '总学费 RM 54,200（2年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DIPLOMA_PDF_002', 24, '2年', 54200, '总学费 RM 54,200（2年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DIPLOMA_PDF_003', 24, '2年', 54200, '总学费 RM 54,200（2年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DIPLOMA_PDF_004', 24, '2年', 54200, '总学费 RM 54,200（2年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DIPLOMA_PDF_005', 24, '2年', 54200, '总学费 RM 54,200（2年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DIPLOMA_PDF_006', 24, '2年', 54200, '总学费 RM 54,200（2年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DIPLOMA_PDF_007', 24, '2年', 54200, '总学费 RM 54,200（2年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DIPLOMA_PDF_008', 24, '2年', 54200, '总学费 RM 54,200（2年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DIPLOMA_PDF_009', 24, '2年', 54200, '总学费 RM 54,200（2年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DIPLOMA_PDF_010', 24, '2年', 54200, '总学费 RM 54,200（2年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DOCTOR_PDF_001', NULL, NULL, 50800, '总学费 RM 50,800，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DOCTOR_PDF_002', NULL, NULL, 50800, '总学费 RM 50,800，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DOCTOR_PDF_003', NULL, NULL, 50800, '总学费 RM 50,800，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DOCTOR_PDF_004', NULL, NULL, 50800, '总学费 RM 50,800，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DOCTOR_PDF_005', NULL, NULL, 50800, '总学费 RM 50,800，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_DOCTOR_PDF_006', NULL, NULL, 56800, '总学费 RM 56,800，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_FOUNDATION_PDF_001', 12, '1年', 28400, '总学费 RM 28,400（1年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_FOUNDATION_PDF_002', 12, '1年', 28400, '总学费 RM 28,400（1年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_FOUNDATION_PDF_003', 12, '1年', 29200, '总学费 RM 29,200（1年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_FOUNDATION_PDF_004', 12, '1年', 28400, '总学费 RM 28,400（1年），不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_001', NULL, NULL, 32000, '总学费 RM 32,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_002', NULL, NULL, 32000, '总学费 RM 32,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_003', NULL, NULL, 32000, '总学费 RM 32,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_004', NULL, NULL, 32000, '总学费 RM 32,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_005', NULL, NULL, 45800, '总学费 RM 45,800，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_006', NULL, NULL, 34800, '总学费 RM 34,800，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_007', NULL, NULL, 45800, '总学费 RM 45,800，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_008', NULL, NULL, 45800, '总学费 RM 45,800，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_009', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_010', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_011', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_012', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_013', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_014', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_015', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_016', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_017', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_018', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_019', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_020', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM'),
    ('APU_MASTER_PDF_021', NULL, NULL, 42000, '总学费 RM 42,000，不含6% SST', 'TOTAL_PROGRAM');

DO $$
DECLARE
    existing_apu_count INTEGER;
    matched_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_apu_count
    FROM programmes p
    JOIN universities u ON u.id = p.university_id
    WHERE u.slug = 'apu';

    SELECT COUNT(*) INTO matched_count
    FROM programmes p
    JOIN universities u ON u.id = p.university_id
    JOIN apu_2026_programme_facts f ON f.programme_code = p.programme_code
    WHERE u.slug = 'apu';

    IF existing_apu_count > 0 AND matched_count <> 71 THEN
        RAISE EXCEPTION 'Expected 71 APU programme matches, found %', matched_count;
    END IF;
END $$;

UPDATE programmes p
SET duration_months = COALESCE(f.duration_months, p.duration_months),
    duration_display = COALESCE(f.duration_display, p.duration_display),
    tuition_min = f.tuition_myr,
    tuition_max = f.tuition_myr,
    tuition_currency = 'MYR',
    tuition_display = f.tuition_display,
    tuition_fee_period = f.tuition_fee_period,
    source_checked_at = TIMESTAMPTZ '2026-10-12 00:00:00+08:00',
    updated_at = CURRENT_TIMESTAMP
FROM apu_2026_programme_facts f, universities u
WHERE p.programme_code = f.programme_code
  AND p.university_id = u.id
  AND u.slug = 'apu';
