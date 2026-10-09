package com.yangdoujiao.website.notification;

import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/miniapp/me/messages")
public class NotificationController {
    private final NotificationService service;
    public NotificationController(NotificationService service) { this.service=service; }
    @GetMapping
    public NotificationService.InboxPage list(@AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required=false) String category,@RequestParam(defaultValue="1") int page,
            @RequestParam(defaultValue="20") int size) { return service.list(recipient(principal),category==null?"ALL":category,page,size); }
    @GetMapping("/unread-count")
    public UnreadCount count(@AuthenticationPrincipal UserPrincipal principal) { return new UnreadCount(service.unreadCount(recipient(principal))); }
    @PutMapping("/{id}/read") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void read(@AuthenticationPrincipal UserPrincipal principal,@PathVariable String id) { service.markRead(recipient(principal),id); }
    private static long recipient(UserPrincipal principal) {
        if(principal==null) throw new ApiException(HttpStatus.UNAUTHORIZED,"AUTH_REQUIRED","Authentication required");
        return principal.userId();
    }
    public record UnreadCount(long unreadCount) {}
}
