package com.yangdoujiao.website.community;

import java.io.IOException;
import java.nio.file.NoSuchFileException;
import java.util.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;
import com.yangdoujiao.website.common.exception.ApiException;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Visibility is checked for every read, including after the upload flag is disabled. */
@RestController
@RequestMapping("/api/v1/community/images")
public class CommunityImageReadController {
    private final CommunityImageAttachments images;
    public CommunityImageReadController(CommunityImageAttachments images) { this.images=images; }
    @GetMapping
    public ResponseEntity<Map<String,List<CommunityImageAttachments.Image>>> list(@RequestParam List<String> postIds,
            @AuthenticationPrincipal UserPrincipal viewer) {
        if(postIds.size()>50)throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_COMMUNITY_IMAGES","Too many posts");
        var ids=postIds.stream().map(CommunityWriteService::decimalId).toList();
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .body(images.forPosts(ids,viewer==null?null:viewer.userId(),viewer!=null&&viewer.isAdviser()));
    }
    @GetMapping("/{id}")
    public ResponseEntity<byte[]> image(@PathVariable String id,@RequestParam(defaultValue="false") boolean thumbnail,
            @AuthenticationPrincipal UserPrincipal viewer) throws IOException {
        try {
            return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options","nosniff")
                .body(images.read(id,thumbnail,viewer==null?null:viewer.userId(),viewer!=null&&viewer.isAdviser()));
        } catch(NoSuchFileException missing) {
            throw new ApiException(HttpStatus.NOT_FOUND,"COMMUNITY_IMAGE_NOT_FOUND","Image unavailable");
        }
    }
}
