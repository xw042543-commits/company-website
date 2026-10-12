BEGIN;

UPDATE programmes
SET name_en = 'Master of Islamic Management & Finance',
    updated_at = CURRENT_TIMESTAMP
WHERE programme_code = 'TAYLOR_BACHELOR_045'
  AND name_en = 'Master of islamic Managemnt & Finance';

UPDATE programmes
SET name_en = 'Master of Oral Science - Application Closed',
    updated_at = CURRENT_TIMESTAMP
WHERE programme_code = 'UM_MASTER_106'
  AND name_en = 'MASTER OFORALSCIENCE-APPLCATION CLOSED';

UPDATE programmes
SET status = 'ARCHIVED',
    published_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE programme_code = 'UM_MASTER_154';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM programmes
        WHERE programme_code = 'TAYLOR_BACHELOR_045'
          AND study_level_id = (SELECT id FROM study_levels WHERE code = 'MASTER')
          AND name_en = 'Master of Islamic Management & Finance'
    ) THEN
        RAISE EXCEPTION 'Taylor programme correction failed';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM programmes
        WHERE programme_code = 'UM_MASTER_106'
          AND name_en = 'Master of Oral Science - Application Closed'
    ) THEN
        RAISE EXCEPTION 'Oral Science programme correction failed';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM programmes
        WHERE programme_code = 'UM_MASTER_154'
          AND status = 'ARCHIVED'
          AND published_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Non-programme archive correction failed';
    END IF;
END $$;

COMMIT;
