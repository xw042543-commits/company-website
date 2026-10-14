-- Curriculum is public only when it has a verifiable university source.
-- Keep old rows for audit/history so a later official import can update and republish them.
UPDATE programme_detail_sections
SET status = 'ARCHIVED',
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'PUBLISHED'
  AND section_type IN ('CURRICULUM', 'COURSE_STRUCTURE')
  AND NULLIF(BTRIM(source_url), '') IS NULL;
