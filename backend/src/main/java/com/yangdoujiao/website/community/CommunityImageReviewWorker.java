package com.yangdoujiao.website.community;

import java.time.Clock;
import org.springframework.scheduling.annotation.Scheduled;

final class CommunityImageReviewWorker {
    private final CommunityImageReviewJobs jobs;
    private final WechatImageReviewGateway gateway;
    private final Clock clock;
    CommunityImageReviewWorker(CommunityImageReviewJobs jobs,WechatImageReviewGateway gateway,Clock clock) {
        this.jobs=jobs;this.gateway=gateway;this.clock=clock;
    }
    @Scheduled(fixedDelayString="${app.community.images.review-poll-ms:10000}")
    public void tick() {
        for(int count=0;count<3;count++) {
            var next=jobs.claim(clock.instant());if(next.isEmpty())break;
            var claim=next.get();
            var trace=gateway.submit(claim.owner(),claim.imageId());
            if(trace.isPresent())jobs.acknowledge(claim,trace.get(),clock.instant());
            else jobs.failed(claim,clock.instant());
        }
    }
}
