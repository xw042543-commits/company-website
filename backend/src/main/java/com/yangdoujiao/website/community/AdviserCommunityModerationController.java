package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@RestController @RequestMapping("/api/v1/adviser/community/moderation")
public class AdviserCommunityModerationController {
    private final CommunityModerationService service;
    AdviserCommunityModerationController(CommunityModerationService service){this.service=service;}
    @GetMapping public CommunityModerationPage queue(@RequestParam(defaultValue="PENDING")String status,
            @RequestParam(required=false)CommunityTargetType targetType,@RequestParam(required=false)String reasonCode,
            @RequestParam(required=false)@DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME)OffsetDateTime from,
            @RequestParam(required=false)@DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME)OffsetDateTime to,
            @RequestParam(required=false)String cursor,@RequestParam(defaultValue="20")int size) {
        return service.queue(status,targetType,reasonCode,from,to,cursor,size);
    }
    @GetMapping("/{targetType}/{targetId}")public CommunityModerationDetail detail(@PathVariable CommunityTargetType targetType,@PathVariable String targetId,
            @RequestParam(required=false)String actionsCursor) {
        return service.detail(targetType,CommunityWriteService.decimalId(targetId),actionsCursor);
    }
    @PostMapping("/{targetType}/{targetId}/actions")public CommunityModerationDetail decide(@PathVariable CommunityTargetType targetType,@PathVariable String targetId,
            @Valid @RequestBody CommunityModerationRequest body,@AuthenticationPrincipal UserPrincipal actor) {
        return service.decide(actor.userId(),targetType,CommunityWriteService.decimalId(targetId),body);
    }
}
