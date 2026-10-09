-- Preserve the exact committed creation response across retries, later moderation, and soft deletion.
-- Nullable for older records; all newly accepted API writes persist a receipt in the same transaction.
ALTER TABLE community_idempotency_records ADD COLUMN result_response TEXT;
