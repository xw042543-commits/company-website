package com.yangdoujiao.website.auth.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yangdoujiao.website.auth.verification.VerificationService;
import com.yangdoujiao.website.common.web.ClientAddressResolver;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final RegistrationService registration;
    private final VerificationService verification;
    private final ClientAddressResolver addresses;

    public AuthController(RegistrationService registration, VerificationService verification,
            ClientAddressResolver addresses) {
        this.registration = registration;
        this.verification = verification;
        this.addresses = addresses;
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(@RequestBody RegisterRequest body, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(registration.register(body, addresses.resolve(request)));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<RegistrationResponse> resend(@RequestBody ResendVerificationRequest body, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(registration.resend(body, addresses.resolve(request)));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestBody VerifyEmailRequest body, HttpServletRequest request) {
        verification.verifyEmail(body == null ? null : body.token(), addresses.resolve(request));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<Void> verifyPhone(@RequestBody VerifyPhoneRequest body, HttpServletRequest request) {
        verification.verifyPhone(body == null ? null : body.phone(), body == null ? null : body.code(),
                addresses.resolve(request));
        return ResponseEntity.noContent().build();
    }
}
