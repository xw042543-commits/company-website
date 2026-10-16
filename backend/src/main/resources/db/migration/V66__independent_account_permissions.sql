-- Independent ordinary administrator/adviser grants. Existing accounts keep their grants.
CREATE TABLE user_account_permissions (
    user_account_id BIGINT NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    permission VARCHAR(20) NOT NULL CHECK (permission IN ('ADMIN', 'ADVISER')),
    PRIMARY KEY (user_account_id, permission)
);
INSERT INTO user_account_permissions(user_account_id,permission)
SELECT id,role FROM user_accounts WHERE role IN ('ADMIN','ADVISER');

-- Keep the old column as a compatibility projection, never as the multi-permission store.
CREATE FUNCTION refresh_account_permission_projection(account_id BIGINT) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    PERFORM id FROM user_accounts WHERE id=account_id FOR UPDATE;
    IF NOT FOUND THEN RETURN; END IF;
    UPDATE user_accounts SET role=CASE
        WHEN EXISTS(SELECT 1 FROM user_account_permissions WHERE user_account_id=account_id AND permission='ADMIN') THEN 'ADMIN'
        WHEN EXISTS(SELECT 1 FROM user_account_permissions WHERE user_account_id=account_id AND permission='ADVISER') THEN 'ADVISER'
        ELSE 'USER' END, updated_at=clock_timestamp() WHERE id=account_id;
END $$;
CREATE FUNCTION account_permission_projection_trigger() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP='DELETE' THEN PERFORM refresh_account_permission_projection(OLD.user_account_id);
    ELSE PERFORM refresh_account_permission_projection(NEW.user_account_id); END IF;
    RETURN NULL;
END $$;
CREATE TRIGGER account_permission_projection AFTER INSERT OR DELETE ON user_account_permissions
FOR EACH ROW EXECUTE FUNCTION account_permission_projection_trigger();

-- Compatibility for existing promotion/maintenance scripts: granting one permission
-- preserves the other. A legacy USER write revokes only the previous primary grant.
CREATE FUNCTION legacy_account_permission_trigger() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF pg_trigger_depth()>1 THEN RETURN NULL; END IF;
    IF TG_OP='INSERT' AND NEW.role='USER' THEN RETURN NULL; END IF;
    IF TG_OP='UPDATE' THEN
        IF NEW.role=OLD.role THEN RETURN NULL; END IF;
        IF NEW.role='USER' AND OLD.role IN ('ADMIN','ADVISER') THEN
            DELETE FROM user_account_permissions WHERE user_account_id=NEW.id AND permission=OLD.role;
        END IF;
    END IF;
    IF NEW.role IN ('ADMIN','ADVISER') THEN
        INSERT INTO user_account_permissions VALUES(NEW.id,NEW.role) ON CONFLICT DO NOTHING;
    END IF;
    PERFORM refresh_account_permission_projection(NEW.id);
    RETURN NULL;
END $$;
CREATE TRIGGER legacy_account_permission AFTER INSERT OR UPDATE OF role ON user_accounts
FOR EACH ROW EXECUTE FUNCTION legacy_account_permission_trigger();

ALTER TABLE account_management_audit DROP CONSTRAINT account_management_audit_action_check;
ALTER TABLE account_management_audit ADD CONSTRAINT account_management_audit_action_check
    CHECK (action IN ('ROLE','STATUS','PROFILE','PERMISSION'));
ALTER TABLE account_management_audit ADD COLUMN old_permissions TEXT[], ADD COLUMN new_permissions TEXT[],
    ADD COLUMN permission_changed VARCHAR(20) CHECK (permission_changed IN ('ADMIN','ADVISER')),
    ADD COLUMN permission_enabled BOOLEAN;
