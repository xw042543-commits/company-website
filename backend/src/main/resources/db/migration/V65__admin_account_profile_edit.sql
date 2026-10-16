ALTER TABLE user_accounts
    ADD COLUMN profile_avatar_url VARCHAR(500),
    ADD COLUMN profile_avatar_overridden BOOLEAN NOT NULL DEFAULT FALSE;

-- Preserve previously uploaded, persisted miniapp avatars as the account avatar.
UPDATE user_accounts u
SET profile_avatar_url=e.avatar_url, profile_avatar_overridden=TRUE
FROM user_external_identities e JOIN miniapp_account_avatars a ON a.user_account_id=e.user_account_id
WHERE e.user_account_id=u.id AND e.provider='WECHAT_MINI_PROGRAM'
  AND e.avatar_url LIKE '%/api/v1/miniapp/avatars/' || u.id || '?v=%';

ALTER TABLE account_management_audit DROP CONSTRAINT account_management_audit_action_check;
ALTER TABLE account_management_audit ADD CONSTRAINT account_management_audit_action_check
    CHECK (action IN ('ROLE', 'STATUS', 'PROFILE'));
ALTER TABLE account_management_audit
    ADD COLUMN old_full_name VARCHAR(100),
    ADD COLUMN new_full_name VARCHAR(100),
    ADD COLUMN avatar_action VARCHAR(10) CHECK (avatar_action IN ('KEEP', 'REPLACE', 'REMOVE'));
