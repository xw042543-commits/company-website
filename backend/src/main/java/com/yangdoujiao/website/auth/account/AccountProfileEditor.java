package com.yangdoujiao.website.auth.account;

import com.yangdoujiao.website.admin.AdminAccountRepository;
import com.yangdoujiao.website.admin.AdminAccountService.Account;
import com.yangdoujiao.website.auth.miniapp.MiniappAvatarRepository;
import com.yangdoujiao.website.common.exception.ApiException;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Shared atomic profile writer; callers authorize and lock the target before editing. */
@Service
public class AccountProfileEditor {
    private final AdminAccountRepository repository;
    private final AvatarImageValidator images;
    private final MiniappAvatarRepository avatars;
    private final String publicOrigin;
    public AccountProfileEditor(AdminAccountRepository repository, AvatarImageValidator images, MiniappAvatarRepository avatars,
            @org.springframework.beans.factory.annotation.Value("${APP_MINIAPP_PUBLIC_ORIGIN:https://yangdoujiao.com}") String publicOrigin) {
        this.repository = repository; this.images = images; this.avatars = avatars;
        this.publicOrigin = publicOrigin.replaceAll("/+$", "");
    }
    @Transactional
    public void editSelf(long actor, ProfileEdit input) {
        repository.lock(actor, actor);
        Account current = repository.account(actor);
        if (!current.status().equals("ACTIVE")) throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "登录已失效，请重新登录");
        editLocked(actor, actor, input);
    }
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.MANDATORY)
    public Account editLocked(long actor, long id, ProfileEdit input) {
        if (input == null || input.expectedUpdatedAt() == null) throw invalid("请刷新账号资料后重试");
        String name = input.fullName() == null ? "" : input.fullName().strip();
        if (name.isEmpty() || name.length() > 100 || name.codePoints().anyMatch(c -> Character.isISOControl(c) || Character.getType(c) == Character.FORMAT))
            throw invalid("用户名须为1至100个字符，不能包含控制字符");
        if (input.avatarAction() == null || !Set.of("KEEP", "REPLACE", "REMOVE").contains(input.avatarAction())) throw invalid("请选择有效的头像操作");
        if (!input.avatarAction().equals("REPLACE") && (input.contentBase64() != null || input.contentType() != null)) throw invalid("仅更换头像时可提交图片");
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
