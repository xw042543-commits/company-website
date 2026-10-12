package com.yangdoujiao.website.community;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@RestController
@RequestMapping("/api/v1/community")
public class CommunityReactionController {
    private final CommunityReactionService reactions;
    public CommunityReactionController(CommunityReactionService reactions) { this.reactions = reactions; }

    @PutMapping("/posts/{id}/like")
    public ResponseEntity<Void> likePost(@PathVariable String id, @AuthenticationPrincipal UserPrincipal actor) {
        reactions.like(actor.userId(), CommunityTargetType.POST, CommunityWriteService.decimalId(id));
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/posts/{id}/like")
    public ResponseEntity<Void> unlikePost(@PathVariable String id, @AuthenticationPrincipal UserPrincipal actor) {
        reactions.unlike(actor.userId(), CommunityTargetType.POST, CommunityWriteService.decimalId(id));
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/comments/{id}/like")
    public ResponseEntity<Void> likeComment(@PathVariable String id, @AuthenticationPrincipal UserPrincipal actor) {
        reactions.like(actor.userId(), CommunityTargetType.COMMENT, CommunityWriteService.decimalId(id));
        return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/comments/{id}/like")
    public ResponseEntity<Void> unlikeComment(@PathVariable String id, @AuthenticationPrincipal UserPrincipal actor) {
        reactions.unlike(actor.userId(), CommunityTargetType.COMMENT, CommunityWriteService.decimalId(id));
        return ResponseEntity.noContent().build();
    }
}
