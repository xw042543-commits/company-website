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
                          boolean advanced, OffsetDateTime createdAt, OffsetDateTime updatedAt) {}
    public record Page<T>(List<T> items, int page, int size, long total, long totalPages) {}
    public record Change(String role, Boolean enabled, Boolean confirmed, OffsetDateTime expectedUpdatedAt) {}
    private final AdminAccountRepository repository;
    private final CatalogLifecycleRepository permissions;
    private final UserSessionService sessions;
    private final String publicOrigin;
    private final com.yangdoujiao.website.auth.account.AvatarImageValidator images;
    private final com.yangdoujiao.website.auth.miniapp.MiniappAvatarRepository avatars;
    public AdminAccountService(AdminAccountRepository repository, CatalogLifecycleRepository permissions, UserSessionService sessions,
            com.yangdoujiao.website.auth.account.AvatarImageValidator images, com.yangdoujiao.website.auth.miniapp.MiniappAvatarRepository avatars, @org.springframework.beans.factory.annotation.Value("${APP_MINIAPP_PUBLIC_ORIGIN:https://yangdoujiao.com}") String publicOrigin) {
        this.repository = repository; this.permissions = permissions; this.sessions = sessions; this.images = images; this.avatars = avatars; this.publicOrigin = publicOrigin.replaceAll("/+$", "");
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
        repository.log(actor, repository.account(actor).fullName(), old, roleChange, role, status);
        return repository.account(id);
    }
    public record ProfileEdit(String fullName, String avatarAction, String contentType, String contentBase64, OffsetDateTime expectedUpdatedAt) {
        @com.fasterxml.jackson.annotation.JsonAnySetter
        public void rejectExtraField(String field, Object value) { throw new IllegalArgumentException("仅允许修改用户名和头像"); }
    }
    @Transactional
    public Account edit(long actor, long id, ProfileEdit input) {
        requireAdvanced(actor);
        if (actor == id) throw invalid("此入口仅用于编辑其他账号");
        if (input == null || input.expectedUpdatedAt() == null) throw invalid("请刷新账号资料后重试");
        String name = input.fullName() == null ? "" : input.fullName().strip();
        if (name.isEmpty() || name.length() > 100 || name.codePoints().anyMatch(c -> Character.isISOControl(c) || Character.getType(c) == Character.FORMAT))
            throw invalid("用户名须为1至100个字符，不能包含控制字符");
        if (input.avatarAction() == null || !Set.of("KEEP", "REPLACE", "REMOVE").contains(input.avatarAction())) throw invalid("请选择有效的头像操作");
        if (!input.avatarAction().equals("REPLACE") && (input.contentBase64() != null || input.contentType() != null)) throw invalid("仅更换头像时可提交图片");
        repository.lock(actor, id);
        requireAdvanced(actor);
        Account old = repository.account(id);
        if (old.status().equals("DELETED")) throw invalid("已注销账号仅可查看");
        if (!old.updatedAt().isEqual(input.expectedUpdatedAt())) throw new ApiException(HttpStatus.CONFLICT, "ACCOUNT_CHANGED", "账号已被更新，请刷新后重新编辑");
        String avatarUrl = old.avatarUrl();
        if (input.avatarAction().equals("REPLACE")) {
            var image = images.validate(input.contentBase64(), input.contentType());
            avatars.save(id, image.contentType(), image.content());
            avatarUrl = publicOrigin + "/api/v1/miniapp/avatars/" + id + "?v=" + UUID.randomUUID();
        } else if (input.avatarAction().equals("REMOVE")) { avatars.delete(id); avatarUrl = null; }
        repository.edit(id, name, input.avatarAction(), avatarUrl);
        repository.profileLog(actor, repository.account(actor).fullName(), old, name, input.avatarAction());
        return repository.account(id);
    }
    private static ApiException invalid(String message) { return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message); }
}
