\set ON_ERROR_STOP on
BEGIN;
-- Run only through compose.load-test.yaml's postgres container, after the backend has run Flyway.
DO $$ BEGIN
  IF current_database() <> 'community_load_test' OR current_user <> 'community_load_test' THEN
    RAISE EXCEPTION 'Refusing to seed outside the isolated community_load_test database';
  END IF;
  IF EXISTS (SELECT 1 FROM user_accounts) OR EXISTS (SELECT 1 FROM community_posts) THEN
    RAISE EXCEPTION 'Refusing to seed a non-empty database; use a fresh isolated environment';
  END IF;
END $$;
CREATE TABLE community_load_test_guard (run_id uuid NOT NULL);
INSERT INTO community_load_test_guard VALUES (gen_random_uuid());
INSERT INTO user_accounts (full_name,status,role,agreement_version,privacy_version,created_at,updated_at)
SELECT 'Synthetic load ' || lpad(n::text,4,'0'),'ACTIVE','USER','synthetic-load-terms','synthetic-load-privacy',now(),now()
FROM generate_series(1,5000) n;
CREATE TEMP TABLE load_credentials AS
SELECT row_number() OVER (ORDER BY id) AS ordinal,id,
  replace(gen_random_uuid()::text || gen_random_uuid()::text,'-','') AS token FROM user_accounts;
INSERT INTO miniapp_auth_tokens (user_account_id,token_hash,token_kind,family_id,expires_at,created_at)
SELECT id,encode(sha256(convert_to(token,'UTF8')),'hex'),'ACCESS',gen_random_uuid(),now()+interval '2 hours',now()
FROM load_credentials;
INSERT INTO community_posts (author_account_id,body,status,published_at,created_at,updated_at)
SELECT id,'isolated-community-load:' || (SELECT run_id::text FROM community_load_test_guard),
  'PUBLISHED',now()-interval '1 day',now()-interval '1 day',now() FROM load_credentials WHERE ordinal<=1000;
INSERT INTO community_comments (post_id,author_account_id,body,status,created_at,updated_at)
SELECT p.id,p.author_account_id,'Synthetic seeded comment','PUBLISHED',now(),now() FROM community_posts p;
UPDATE community_posts SET comment_count=1;
CREATE TEMP VIEW load_fixture AS
SELECT json_build_object('marker','isolated-community-load-v1','baseUrl','http://127.0.0.1:18080',
  'runId',g.run_id::text,'sentinelBody','isolated-community-load:' || g.run_id::text,
  'accounts',(SELECT json_agg(json_build_object('id',id::text,'token',token) ORDER BY ordinal) FROM load_credentials),
  'postIds',(SELECT json_agg(id::text ORDER BY id) FROM community_posts))::text AS fixture
FROM community_load_test_guard g;
-- Client output is a local disposable credential fixture. Never commit it or attach it to capacity evidence.
\copy (SELECT fixture FROM load_fixture) TO '/tmp/community-load-fixture.json' WITH (FORMAT text)
COMMIT;
