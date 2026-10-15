\if :{?identifier}
\else
\echo 'Usage: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v identifier="user@example.com" -f backend/scripts/promote-existing-admin.sql'
\quit 2
\endif

BEGIN;

SELECT COUNT(*) = 1 AS account_found
  FROM user_accounts
 WHERE status = 'ACTIVE'
   AND (normalized_email = LOWER(BTRIM(:'identifier')) OR normalized_phone = BTRIM(:'identifier'))
\gset

\if :account_found
UPDATE user_accounts
   SET role = 'ADMIN', updated_at = CURRENT_TIMESTAMP
 WHERE status = 'ACTIVE'
   AND (normalized_email = LOWER(BTRIM(:'identifier')) OR normalized_phone = BTRIM(:'identifier'));
COMMIT;
\echo 'Administrator role granted. The account must sign out and sign in again.'
\else
ROLLBACK;
\echo 'No single active account matched; no changes were made.'
\quit 3
\endif
