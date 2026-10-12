package com.yangdoujiao.website.auth.miniapp;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/miniapp/auth")
public class MiniappAuthController {
    private final MiniappLoginService login;
    private final MiniappTokenService tokens;

    public MiniappAuthController(MiniappLoginService login, MiniappTokenService tokens) {
        this.login = login;
        this.tokens = tokens;
    }

    @PostMapping("/login")
    public MiniappSessionResponse login(@RequestBody(required = false) MiniappLoginRequest body) {
        return login.login(body == null ? null : body.code());
    }

    @PostMapping("/refresh")
    public MiniappSessionResponse refresh(@RequestBody(required = false) MiniappRefreshRequest body) {
        return login.refresh(body == null ? null : body.refreshToken());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody(required = false) MiniappLogoutRequest body) {
        tokens.revokeFamily(body == null ? null : body.refreshToken());
        return ResponseEntity.noContent().build();
    }
}
