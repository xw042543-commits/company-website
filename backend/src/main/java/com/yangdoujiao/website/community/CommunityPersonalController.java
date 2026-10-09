package com.yangdoujiao.website.community;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@RestController @RequestMapping("/api/v1/community/me")
public class CommunityPersonalController {
    private final CommunityPersonalService service;
    public CommunityPersonalController(CommunityPersonalService service) { this.service = service; }
    @GetMapping("/posts")
    public CommunityCursorPage<CommunityMyPost> posts(@AuthenticationPrincipal UserPrincipal actor,
            @RequestParam(required=false) String cursor, @RequestParam(defaultValue="20") int size) {
        return service.posts(actor.userId(), cursor, size);
    }
    @GetMapping("/comments")
    public CommunityCursorPage<CommunityMyComment> comments(@AuthenticationPrincipal UserPrincipal actor,
            @RequestParam(required=false) String cursor, @RequestParam(defaultValue="20") int size) {
        return service.comments(actor.userId(), cursor, size);
    }
}
