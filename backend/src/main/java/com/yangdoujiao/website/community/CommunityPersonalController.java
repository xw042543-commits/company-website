package com.yangdoujiao.website.community;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@RestController @RequestMapping("/api/v1/community/me")
public class CommunityPersonalController {
    private final CommunityPersonalService service;
    public CommunityPersonalController(CommunityPersonalService service) { this.service = service; }
    @GetMapping("/posts")
    public org.springframework.http.ResponseEntity<?> posts(@AuthenticationPrincipal UserPrincipal actor,
            @RequestParam(required=false) String cursor, @RequestParam(defaultValue="20") int size,
            @RequestParam(required=false) String representation) {
        boolean campus = CommunityPostRepresentation.campus(representation);
        return CommunityPostRepresentation.personal(service.posts(actor.userId(), cursor, size), campus);
    }
    @GetMapping("/comments")
    public CommunityCursorPage<CommunityMyComment> comments(@AuthenticationPrincipal UserPrincipal actor,
            @RequestParam(required=false) String cursor, @RequestParam(defaultValue="20") int size) {
        return service.comments(actor.userId(), cursor, size);
    }
}
