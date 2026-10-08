package com.yangdoujiao.website.community;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@RestController
@RequestMapping("/api/v1/community/posts")
public class CommunityPostController {
    private final CommunityReadService service;
    private final CommunityWriteService writes;
    private final com.yangdoujiao.website.common.web.ClientAddressResolver addresses;

    public CommunityPostController(CommunityReadService service, CommunityWriteService writes,
            com.yangdoujiao.website.common.web.ClientAddressResolver addresses) {
        this.service = service; this.writes = writes; this.addresses = addresses;
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<CommunityCreationResponse> create(
            @RequestHeader(value = "Idempotency-Key", required = false) String key, @RequestBody CommunityPostRequest body,
            @AuthenticationPrincipal UserPrincipal actor, jakarta.servlet.http.HttpServletRequest request) {
        var result = writes.createPost(actor.userId(), addresses.resolve(request), key, body);
        return org.springframework.http.ResponseEntity.status(result.replay() ? 200 : 201).body(result.response());
    }

    @DeleteMapping("/{id}")
    public org.springframework.http.ResponseEntity<Void> delete(@PathVariable String id,
            @AuthenticationPrincipal UserPrincipal actor) {
        writes.deletePost(actor.userId(), CommunityWriteService.decimalId(id));
        return org.springframework.http.ResponseEntity.noContent().build();
    }

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

    @GetMapping("/{id}/comments/{parentId}/replies")
    public CommunityCursorPage<CommunityCommentView> replies(@PathVariable Long id, @PathVariable Long parentId,
            @RequestParam(required = false) String cursor, @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal viewer) {
        return service.replies(id, parentId, cursor, size, viewer);
    }
}
