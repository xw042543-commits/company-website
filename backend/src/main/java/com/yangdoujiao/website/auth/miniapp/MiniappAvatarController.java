package com.yangdoujiao.website.auth.miniapp;

import java.time.Duration;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/miniapp/avatars")
public class MiniappAvatarController {
    private final MiniappAvatarService avatars;

    public MiniappAvatarController(MiniappAvatarService avatars) {
        this.avatars = avatars;
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<byte[]> avatar(@PathVariable long accountId) {
        MiniappAvatarRepository.StoredAvatar avatar = avatars.find(accountId);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(avatar.contentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic().immutable())
                .body(avatar.content());
    }
}
