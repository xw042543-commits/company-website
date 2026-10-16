package com.yangdoujiao.website.admin;

import com.yangdoujiao.website.auth.session.UserSessionService;
import com.yangdoujiao.website.common.exception.ApiException;
import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminAccountService {
    public record Account(long id, String fullName, String email, String phone, String role, String status, String avatarUrl,
                          boolean advanced, OffsetDateTime createdAt, OffsetDateTime updatedAt, List<String> permissions) {}
    public record Page<T>(List<T> items, int page, int size, long total, long totalPages) {}
    public record Change(String role, Boolean enabled, Boolean confirmed, OffsetDateTime expectedUpdatedAt) {}
    public record PermissionChange(Boolean enabled, Boolean confirmed, OffsetDateTime expectedUpdatedAt) {}
    private final AdminAccountRepository repository;
    private final CatalogLifecycleRepository permissions;
    private final UserSessionService sessions;
    private final com.yangdoujiao.website.auth.account.AccountProfileEditor profiles;
    public AdminAccountService(AdminAccountRepository repository, CatalogLifecycleRepository permissions, UserSessionService sessions,
            com.yangdoujiao.website.auth.account.AccountProfileEditor profiles) {
        this.repository = repository; this.permissions = permissions; this.sessions = sessions; this.profiles = profiles;
    }
    private void requireAdvanced(long actor) {
        if (!permissions.advanced(actor)) throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "仅现有高级管理员可管理账号");
    }
    public Page<Account> list(long actor, String q, String status, String identity, int page, int size) {
        requireAdvanced(actor); return repository.list(q, status, identity, page, size);
    }
    public Account detail(long actor, long id) { requireAdvanced(actor); return repository.account(id); }
    public Page<Map<String,Object>> audit(long actor, Long target, int page, int size) {
        requireAdvanced(actor); return repository.audit(target, page, size);
    }
    @Transactional
    public Account change(long actor, long id, Change input, boolean roleChange) {
        requireAdvanced(actor);
        if (actor == id) throw invalid("为保护登录安全，不能修改自己的身份或账号状态");
        if (input == null || !Boolean.TRUE.equals(input.confirmed()) || input.expectedUpdatedAt() == null) throw invalid("请先核对账号并二次确认操作");
        // Lock both accounts in a stable order; recheck authority under the locks.
        repository.lock(actor, id);
        requireAdvanced(actor);
        Account old = repository.account(id);
        if (!old.updatedAt().isEqual(input.expectedUpdatedAt())) throw new ApiException(HttpStatus.CONFLICT, "ACCOUNT_CHANGED", "账号已被其他操作更新，请刷新后重新确认");
        if (old.status().equals("DELETED")) throw invalid("已注销账号仅可查看，不能恢复或修改身份");
        String role = old.role(), status = old.status();
        if (roleChange) {
            if (input.role() == null || !Set.of("USER", "ADMIN").contains(input.role())) throw invalid("仅支持普通用户和普通管理员之间调整");
            if (old.advanced() || !Set.of("USER", "ADMIN").contains(old.role())) throw invalid("高级管理员及顾问身份请沿用现有专用授权流程");
            if (input.role().equals("ADMIN") && !status.equals("ACTIVE")) throw invalid("请先启用并完成账号验证，再设置管理员");
            role = input.role();
        } else {
            if (input.enabled() == null) throw invalid("请选择启用或禁用");
            if (input.enabled() && status.equals("DISABLED")) status = repository.restoreStatus(id);
            else if (!input.enabled()) status = "DISABLED";
        }
        if (role.equals(old.role()) && status.equals(old.status())) return old;
        repository.update(id, roleChange, role, status);
        sessions.revokeAll(id);
        repository.revokeTokens(id);
        repository.log(actor, repository.account(actor).fullName(), old, roleChange, repository.account(id).role(), status);
        return repository.account(id);
    }
    @Transactional
    public Account permission(long actor, long id, String permission, PermissionChange input) {
        requireAdvanced(actor);
        if (!Set.of("ADMIN", "ADVISER").contains(permission)) throw invalid("请选择普通管理员或顾问权限");
        if (input == null || input.enabled() == null || !Boolean.TRUE.equals(input.confirmed()) || input.expectedUpdatedAt() == null)
            throw invalid("请先核对账号并二次确认操作");
        repository.lock(actor, id);
        requireAdvanced(actor);
        Account old = repository.account(id);
        if (!old.updatedAt().isEqual(input.expectedUpdatedAt()))
            throw new ApiException(HttpStatus.CONFLICT, "ACCOUNT_CHANGED", "账号已被其他操作更新，请刷新后重新确认");
        if (old.status().equals("DELETED")) throw invalid("已注销账号仅可查看，不能修改权限");
        if (old.permissions().contains(permission) == input.enabled()) return old;
        // Only the selected grant changes. Advanced authorization is never edited here.
        repository.setPermission(id, permission, input.enabled());
        Account updated = repository.account(id);
        sessions.revokeAll(id);
        repository.revokeTokens(id);
        repository.permissionLog(actor, repository.account(actor).fullName(), old, updated, permission, input.enabled());
        return updated;
    }
    @Transactional
    public Account edit(long actor, long id, com.yangdoujiao.website.auth.account.ProfileEdit input) {
        requireAdvanced(actor);
        if (actor == id) throw invalid("此入口仅用于编辑其他账号");
        repository.lock(actor, id);
        requireAdvanced(actor);
        return profiles.editLocked(actor, id, input);
    }
    private static ApiException invalid(String message) { return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message); }
}
