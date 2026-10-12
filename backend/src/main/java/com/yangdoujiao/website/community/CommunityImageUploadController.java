package com.yangdoujiao.website.community;

import java.io.IOException;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/community/images")
@ConditionalOnProperty(name="app.community.images.enabled",havingValue="true")
public class CommunityImageUploadController {
    private final CommunityImageUploadService service;
    public CommunityImageUploadController(CommunityImageUploadService service) { this.service=service; }
    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommunityImageUploadService.Upload> upload(@RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal actor) throws IOException {
        if(actor==null) throw new ApiException(HttpStatus.UNAUTHORIZED,"AUTHENTICATION_REQUIRED","Authentication is required");
        if(file.getSize()>5L*1024*1024) throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_COMMUNITY_IMAGE","Image exceeds upload limit");
        try(var stream=file.getInputStream()) {
            return ResponseEntity.status(HttpStatus.CREATED).cacheControl(CacheControl.noStore())
                .body(service.upload(actor.userId(),stream.readNBytes(5*1024*1024+1)));
        }
    }
}
