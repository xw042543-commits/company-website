package com.yangdoujiao.website.auth.verification;

import java.net.InetAddress;
import java.net.UnknownHostException;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.yangdoujiao.website.common.exception.ApiException;

import jakarta.servlet.http.HttpServletRequest;

@Controller
@Profile("!prod & (dev | test)")
public class LocalAuthNotificationController {
    private final LocalAuthNotificationStore store;

    public LocalAuthNotificationController(LocalAuthNotificationStore store) { this.store = store; }

    @GetMapping("/api/dev/auth/notifications/latest")
    public ResponseEntity<LocalAuthNotificationStore.Notification> latest(
            @RequestParam String identifier, HttpServletRequest request) {
        if (!loopback(request.getRemoteAddr())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied");
        }
        LocalAuthNotificationStore.Notification notification = store.take(identifier)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Not found"));
        return ResponseEntity.ok().header("Cache-Control", "no-store")
                .header("Pragma", "no-cache").body(notification);
    }

    private boolean loopback(String address) {
        if (address == null || (!address.matches("[0-9.]+") && !address.matches("[0-9a-fA-F:.]+"))) return false;
        try {
            return InetAddress.getByName(address).isLoopbackAddress();
        } catch (UnknownHostException exception) {
            return false;
        }
    }
}
