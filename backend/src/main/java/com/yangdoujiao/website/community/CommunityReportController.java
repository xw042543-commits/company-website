package com.yangdoujiao.website.community;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.web.ClientAddressResolver;
import jakarta.servlet.http.HttpServletRequest;

@RestController @RequestMapping("/api/v1/community/reports")
public class CommunityReportController {
    private final CommunityReportService service;
    private final ClientAddressResolver addresses;
    CommunityReportController(CommunityReportService service,ClientAddressResolver addresses){this.service=service;this.addresses=addresses;}
    @PostMapping public ResponseEntity<CommunityReportResponse> submit(@AuthenticationPrincipal UserPrincipal actor,
            @RequestHeader(value="Idempotency-Key",required=false)String key,@RequestBody CommunityReportRequest body,HttpServletRequest request) {
        var result=service.submit(actor.userId(),addresses.resolve(request),key,body);
        return ResponseEntity.status(result.replay()?200:201).body(result.response());
    }
}
