package com.yangdoujiao.website.auth.miniapp;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.auth.external.ExternalIdentityProvider;
import com.yangdoujiao.website.auth.external.UserExternalIdentity;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
public class MiniappAvatarService {
    static final int MAX_BYTES = 1024 * 1024;
    private final MiniappAvatarRepository avatars;
    private final UserExternalIdentityRepository identities;
    private final String publicOrigin;

    public MiniappAvatarService(MiniappAvatarRepository avatars, UserExternalIdentityRepository identities,
            @Value("${APP_MINIAPP_PUBLIC_ORIGIN:https://yangdoujiao.com}") String publicOrigin) {
        this.avatars = avatars;
        this.identities = identities;
        this.publicOrigin = publicOrigin.replaceAll("/+$", "");
    }

    @Transactional
    public MiniappAccountResponse update(long accountId, MiniappAvatarRequest request) {
        byte[] content = decode(request == null ? null : request.contentBase64());
        String type = detectedType(content);
        if (request.contentType() != null && !request.contentType().isBlank()
                && !type.equals(request.contentType().toLowerCase())) {
            throw invalid();
        }
        UserExternalIdentity identity = identities.findByProviderAndUserAccountId(
                ExternalIdentityProvider.WECHAT_MINI_PROGRAM, accountId).orElseThrow(this::unauthorized);
        avatars.save(accountId, type, content);
        identity.updateProfile(null, avatarUrl(accountId, OffsetDateTime.now()), OffsetDateTime.now());
        identities.save(identity);
        return MiniappAccountResponse.from(identity.getUserAccount(), identity);
    }

    public MiniappAvatarRepository.StoredAvatar find(long accountId) {
        return avatars.find(accountId).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND, "AVATAR_NOT_FOUND", "Avatar was not found"));
    }

    private byte[] decode(String encoded) {
        if (encoded == null || encoded.isBlank() || encoded.length() > 1_398_104) throw invalid();
        try {
            byte[] content = Base64.getDecoder().decode(encoded);
            if (content.length == 0 || content.length > MAX_BYTES) throw invalid();
            return content;
        } catch (IllegalArgumentException exception) {
            throw invalid();
        }
    }

    private String detectedType(byte[] bytes) {
        if (starts(bytes, new int[]{0xff, 0xd8, 0xff})) return "image/jpeg";
        if (starts(bytes, new int[]{0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a})) return "image/png";
        if (bytes.length >= 12 && starts(bytes, new int[]{'R','I','F','F'})
                && Arrays.equals(Arrays.copyOfRange(bytes, 8, 12), new byte[]{'W','E','B','P'})) return "image/webp";
        throw invalid();
    }

    private boolean starts(byte[] bytes, int[] signature) {
        if (bytes.length < signature.length) return false;
        for (int i = 0; i < signature.length; i++) if ((bytes[i] & 0xff) != signature[i]) return false;
        return true;
    }

    private String avatarUrl(long accountId, OffsetDateTime version) {
        return publicOrigin + "/api/v1/miniapp/avatars/" + accountId + "?v=" + version.toInstant().toEpochMilli();
    }

    private ApiException invalid() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_AVATAR", "Avatar must be a JPEG, PNG or WebP up to 1 MB");
    }

    private ApiException unauthorized() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required");
    }
}
