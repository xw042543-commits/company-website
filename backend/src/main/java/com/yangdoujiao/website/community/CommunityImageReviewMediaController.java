package com.yangdoujiao.website.community;

import java.io.IOException;
import com.yangdoujiao.website.common.exception.ApiException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@ConditionalOnProperty(name="app.community.images.review-enabled",havingValue="true")
class CommunityImageReviewMediaController {
    private final CommunityImageReviewAccess access;
    private final CommunityImageAttachments images;
    CommunityImageReviewMediaController(CommunityImageReviewAccess access,CommunityImageAttachments images){this.access=access;this.images=images;}
    // Keep already-issued review links valid across a rolling deployment.
    @GetMapping("/api/v1/community/image-review/media/{id}")
    ResponseEntity<byte[]> readLegacy(@PathVariable String id,
            @RequestParam(defaultValue="0") long expires,
            @RequestParam(defaultValue="") String signature)throws IOException {
        return read(id,expires,signature);
    }
    @GetMapping("/api/v1/community/image-review/media/{id}/{expires}/{signature}.jpg")
    ResponseEntity<byte[]> read(@PathVariable String id,@PathVariable long expires,@PathVariable String signature)throws IOException {
        if(!access.verify(id,expires,signature))throw new ApiException(HttpStatus.NOT_FOUND,"COMMUNITY_IMAGE_NOT_FOUND","Image unavailable");
        byte[] image=images.read(id,false,null,true);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).contentType(MediaType.IMAGE_JPEG)
            .contentLength(image.length).header("X-Content-Type-Options","nosniff").body(image);
    }
}
