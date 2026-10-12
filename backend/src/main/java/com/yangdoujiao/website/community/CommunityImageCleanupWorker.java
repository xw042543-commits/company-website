package com.yangdoujiao.website.community;

import com.yangdoujiao.website.community.media.CommunityImageStorage;
import java.time.Clock;
import org.springframework.scheduling.annotation.Scheduled;

final class CommunityImageCleanupWorker {
    private final CommunityImageCleanupRepository repository;
    private final CommunityImageStorage storage;
    private final Clock clock;
    CommunityImageCleanupWorker(CommunityImageCleanupRepository repository,CommunityImageStorage storage,Clock clock) {
        this.repository=repository;this.storage=storage;this.clock=clock;
    }
    @Scheduled(initialDelay=60000,fixedDelay=600000)
    public void clean() { repository.expireUnbound(clock.instant(),storage); }
}
