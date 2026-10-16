package com.yangdoujiao.website.admin;

import static com.yangdoujiao.website.admin.AdminAccountService.*;
import java.time.OffsetDateTime;
import java.util.*;
import com.yangdoujiao.website.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AdminAccountRepository {
    private final JdbcTemplate jdbc;
    public AdminAccountRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    private static final String ADVANCED = "EXISTS(SELECT 1 FROM catalog_advanced_administrators a WHERE a.user_account_id=u.id)";
    private static final String AVATAR = "CASE WHEN u.profile_avatar_overridden THEN u.profile_avatar_url ELSE (SELECT e.avatar_url FROM user_external_identities e WHERE e.user_account_id=u.id ORDER BY CASE WHEN e.provider='WECHAT' THEN 0 ELSE 1 END,e.id LIMIT 1) END AS avatar_url";
    private static final String COLUMNS = "u.id,u.full_name,u.normalized_email,u.normalized_phone,u.role,u.status,u.created_at,u.updated_at," + ADVANCED + " AS advanced," + AVATAR;
    public Page<Account> list(String q, String status, String identity, int page, int size) {
        String where = " WHERE 1=1";
        var args = new HashMap<String, Object>();
        if (!q.isBlank()) {
            if (q.length() > 100) throw invalid("搜索内容不能超过100个字");
            where += " AND (u.full_name ILIKE :q ESCAPE '!' OR u.normalized_email ILIKE :q ESCAPE '!' OR u.normalized_phone ILIKE :q ESCAPE '!')";
            args.put("q", "%" + q.trim().replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%");
        }
        if (!status.isBlank()) {
            if (!Set.of("ACTIVE", "PENDING_VERIFICATION", "DISABLED", "DELETED").contains(status)) throw invalid("请选择有效账号状态");
            where += " AND u.status=:status"; args.put("status", status);
        }
        if (!identity.isBlank()) {
            where += switch (identity) {
                case "ADVANCED" -> " AND u.role='ADMIN' AND " + ADVANCED;
                case "ADMIN" -> " AND u.role='ADMIN' AND NOT " + ADVANCED;
                case "USER", "ADVISER" -> { args.put("role", identity); yield " AND u.role=:role"; }
                default -> throw invalid("请选择有效身份");
            };
        }
        var named = new NamedParameterJdbcTemplate(jdbc);
        long total = named.queryForObject("SELECT COUNT(*) FROM user_accounts u" + where, args, Long.class);
        args.put("limit", size); args.put("offset", ((long) page - 1) * size);
        var items = named.query("SELECT " + COLUMNS + " FROM user_accounts u" + where + " ORDER BY u.created_at DESC,u.id DESC LIMIT :limit OFFSET :offset", args,
            (r, n) -> new Account(r.getLong("id"), r.getString("full_name"), r.getString("normalized_email"), r.getString("normalized_phone"), r.getString("role"), r.getString("status"), r.getString("avatar_url"), r.getBoolean("advanced"), r.getObject("created_at", OffsetDateTime.class), r.getObject("updated_at", OffsetDateTime.class)));
        return new Page<>(items, page, size, total, (total + size - 1) / size);
    }
    public Account account(long id) {
        var rows = jdbc.query("SELECT " + COLUMNS + " FROM user_accounts u WHERE u.id=?", (r, n) -> new Account(r.getLong("id"), r.getString("full_name"), r.getString("normalized_email"), r.getString("normalized_phone"), r.getString("role"), r.getString("status"), r.getString("avatar_url"), r.getBoolean("advanced"), r.getObject("created_at", OffsetDateTime.class), r.getObject("updated_at", OffsetDateTime.class)), id);
        if (rows.isEmpty()) throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "账号不存在");
        return rows.getFirst();
    }
    public Page<Map<String,Object>> audit(Long target, int page, int size) {
        String where = target == null ? "" : " WHERE target_user_id=?";
        Object[] args = target == null ? new Object[]{} : new Object[]{target};
        long total = jdbc.queryForObject("SELECT COUNT(*) FROM account_management_audit" + where, Long.class, args);
        var params = new ArrayList<>(Arrays.asList(args)); params.add(size); params.add(((long)page - 1) * size);
        return new Page<>(jdbc.queryForList("SELECT id,actor_user_id,target_user_id,actor_name,target_name,action,old_role,new_role,old_status,new_status,old_full_name,new_full_name,avatar_action,created_at FROM account_management_audit" + where + " ORDER BY id DESC LIMIT ? OFFSET ?", params.toArray()), page, size, total, (total + size - 1) / size);
    }
    public record PublicProfile(long id, String name, String avatarUrl, boolean avatarOverridden) {}
    public List<PublicProfile> editedPublicProfiles(List<Long> ids) {
        if (ids.isEmpty()) return List.of();
        // Only names explicitly saved through the profile editor become public usernames.
        // Preserve legacy external nicknames for accounts that have never edited their profile.
        return new NamedParameterJdbcTemplate(jdbc).query("SELECT " + COLUMNS + ",u.profile_avatar_overridden FROM user_accounts u WHERE u.id IN (:ids) AND u.status='ACTIVE' AND u.deleted_at IS NULL AND EXISTS(SELECT 1 FROM account_management_audit a WHERE a.target_user_id=u.id AND a.action='PROFILE')", Map.of("ids", ids),
            (r,n) -> new PublicProfile(r.getLong("id"), r.getString("full_name"), r.getString("avatar_url"), r.getBoolean("profile_avatar_overridden")));
    }
    public String restoreStatus(long id) {
        var previous = jdbc.queryForList("SELECT old_status FROM account_management_audit WHERE target_user_id=? AND action='STATUS' AND new_status='DISABLED' ORDER BY id DESC LIMIT 1", String.class, id);
        if (!previous.isEmpty() && Set.of("ACTIVE", "PENDING_VERIFICATION").contains(previous.getFirst())) return previous.getFirst();
        boolean verified = Boolean.TRUE.equals(jdbc.queryForObject("SELECT email_verified_at IS NOT NULL OR phone_verified_at IS NOT NULL OR EXISTS(SELECT 1 FROM user_external_identities e WHERE e.user_account_id=u.id) FROM user_accounts u WHERE u.id=?", Boolean.class, id));
        return verified ? "ACTIVE" : "PENDING_VERIFICATION";
    }
    public void lock(long actor, long target) {
        jdbc.queryForList("SELECT id FROM user_accounts WHERE id IN (?,?) ORDER BY id FOR UPDATE", actor, target);
    }
    public void update(long id, boolean roleChange, String role, String status) {
        if (roleChange) jdbc.update("UPDATE user_accounts SET role=?,updated_at=clock_timestamp() WHERE id=?", role, id);
        else jdbc.update("UPDATE user_accounts SET status=?,updated_at=clock_timestamp() WHERE id=?", status, id);
    }
    public void revokeTokens(long id) {
        jdbc.update("UPDATE miniapp_auth_tokens SET revoked_at=GREATEST(CURRENT_TIMESTAMP,created_at) WHERE user_account_id=? AND revoked_at IS NULL", id);
    }
    public void log(long actor, String actorName, Account old, boolean roleChange, String role, String status) {
        jdbc.update("INSERT INTO account_management_audit(actor_user_id,target_user_id,actor_name,target_name,action,old_role,new_role,old_status,new_status) VALUES(?,?,?,?,?,?,?,?,?)", actor, old.id(), actorName, old.fullName(), roleChange ? "ROLE" : "STATUS", old.role(), role, old.status(), status);
    }
    public void edit(long id, String name, String avatarAction, String avatarUrl) {
        if (avatarAction.equals("KEEP")) jdbc.update("UPDATE user_accounts SET full_name=?,updated_at=clock_timestamp() WHERE id=?", name, id);
        else jdbc.update("UPDATE user_accounts SET full_name=?,profile_avatar_url=?,profile_avatar_overridden=TRUE,updated_at=clock_timestamp() WHERE id=?", name, avatarUrl, id);
    }
    public void profileLog(long actor, String actorName, Account old, String name, String action) {
        jdbc.update("INSERT INTO account_management_audit(actor_user_id,target_user_id,actor_name,target_name,action,old_role,new_role,old_status,new_status,old_full_name,new_full_name,avatar_action) VALUES(?,?,?,?,'PROFILE',?,?,?,?,?,?,?)", actor, old.id(), actorName, old.fullName(), old.role(), old.role(), old.status(), old.status(), old.fullName(), name, action);
    }
    private static ApiException invalid(String message) { return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message); }
}
