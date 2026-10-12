package com.yangdoujiao.website.community;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.web.ClientAddressResolver;

@RestController
@RequestMapping("/api/v1/community")
public class CommunityCommentController {
    private final CommunityWriteService writes;
    private final ClientAddressResolver addresses;
    public CommunityCommentController(CommunityWriteService writes, ClientAddressResolver addresses) {
        this.writes = writes; this.addresses = addresses;
    }
    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<CommunityCreationResponse> create(@PathVariable String id,
            @RequestHeader(value = "Idempotency-Key", required = false) String key,
            @RequestBody CommunityCommentRequest body, @AuthenticationPrincipal UserPrincipal actor, HttpServletRequest request) {
        var result = writes.createComment(actor.userId(), CommunityWriteService.decimalId(id), addresses.resolve(request), key, body);
        return ResponseEntity.status(result.replay() ? 200 : 201).body(result.response());
    }
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @AuthenticationPrincipal UserPrincipal actor) {
        writes.deleteComment(actor.userId(), CommunityWriteService.decimalId(id));
        return ResponseEntity.noContent().build();
    }
}
