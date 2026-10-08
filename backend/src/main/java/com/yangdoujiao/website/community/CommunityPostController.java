package com.yangdoujiao.website.community;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@RestController
@RequestMapping("/api/v1/community/posts")
public class CommunityPostController {
    private final CommunityReadService service;

    public CommunityPostController(CommunityReadService service) { this.service = service; }

    @GetMapping
    public CommunityCursorPage<CommunityPostSummary> list(@RequestParam(defaultValue = "latest") String sort,
            @RequestParam(required = false) String cursor, @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal viewer) {
        return service.list(sort, cursor, size, viewer);
    }

    @GetMapping("/{id}")
    public CommunityPostDetail detail(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal viewer) {
        return service.detail(id, viewer);
    }

    @GetMapping("/{id}/comments")
    public CommunityCursorPage<CommunityCommentView> comments(@PathVariable Long id,
            @RequestParam(required = false) String cursor, @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal viewer) {
        return service.comments(id, cursor, size, viewer);
    }
}
