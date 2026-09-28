package com.yangdoujiao.website.auth.api;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.auth.password.PasswordService;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.web.ClientAddressResolver;
import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/v1/account")
public class AccountController {
    private final PasswordService passwords;
    private final ClientAddressResolver addresses;

    public AccountController(PasswordService passwords, ClientAddressResolver addresses) {
        this.passwords = passwords;
        this.addresses = addresses;
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest body,
            @AuthenticationPrincipal UserPrincipal principal, HttpServletRequest request) {
        if (principal == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "Authentication required");
        }
        passwords.changePassword(principal.userId(), body == null ? null : body.currentPassword(),
                body == null ? null : body.newPassword(), addresses.resolve(request));
        HttpSession current = request.getSession(false);
        if (current != null) current.invalidate();
        return ResponseEntity.noContent().build();
    }
}
