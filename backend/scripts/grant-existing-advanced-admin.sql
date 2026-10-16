\set ON_ERROR_STOP on
\if :{?identifier}
\else
\echo 'An existing administrator email is required.'
DO $$ BEGIN RAISE EXCEPTION 'Required authorization parameters are missing'; END $$;
\endif
\if :{?approved_by}
\else
\echo 'An approval reference is required.'
DO $$ BEGIN RAISE EXCEPTION 'Required authorization parameters are missing'; END $$;
\endif

BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '30s';

SELECT to_regclass('catalog_advanced_administrators') IS NOT NULL AND to_regclass('user_account_permissions') IS NOT NULL AS schema_ready \gset
\if :schema_ready
\else
ROLLBACK;
\echo 'V66 must already be deployed; no changes were made.'
DO $$ BEGIN RAISE EXCEPTION 'Advanced administrator schema is not deployed'; END $$;
\endif

SELECT COUNT(*) = 1 AS account_found FROM user_accounts
WHERE normalized_email = lower(btrim(:'identifier'))
  AND (EXISTS(SELECT 1 FROM user_account_permissions g WHERE g.user_account_id=user_accounts.id AND g.permission='ADMIN') OR EXISTS(SELECT 1 FROM catalog_advanced_administrators a WHERE a.user_account_id=user_accounts.id))
  AND status = 'ACTIVE' AND deleted_at IS NULL \gset
\if :account_found
SELECT id AS target_account_id FROM user_accounts
WHERE normalized_email = lower(btrim(:'identifier'))
  AND (EXISTS(SELECT 1 FROM user_account_permissions g WHERE g.user_account_id=user_accounts.id AND g.permission='ADMIN') OR EXISTS(SELECT 1 FROM catalog_advanced_administrators a WHERE a.user_account_id=user_accounts.id))
  AND status = 'ACTIVE' AND deleted_at IS NULL
FOR UPDATE \gset

INSERT INTO catalog_advanced_administrators(user_account_id, granted_by)
VALUES (:'target_account_id'::bigint, :'approved_by')
ON CONFLICT (user_account_id) DO NOTHING;

SELECT EXISTS(SELECT 1 FROM catalog_advanced_administrators
    WHERE user_account_id = :'target_account_id'::bigint) AS grant_verified \gset
\if :grant_verified
COMMIT;
-- A fresh post-commit read verifies the durable grant rather than an uncommitted row.
SELECT u.id AS account_id,u.normalized_email,u.role,u.status,
       (a.user_account_id IS NOT NULL) AS permanent_advanced_administrator,a.granted_at
FROM user_accounts u JOIN catalog_advanced_administrators a ON a.user_account_id=u.id
WHERE u.id=:'target_account_id'::bigint;
\else
ROLLBACK;
\echo 'Grant verification failed; no changes were committed.'
DO $$ BEGIN RAISE EXCEPTION 'Durable advanced administrator grant verification failed'; END $$;
\endif
\else
ROLLBACK;
\echo 'No single active existing ADMIN matched; no changes were made.'
DO $$ BEGIN RAISE EXCEPTION 'No single active existing ADMIN matched'; END $$;
\endif
