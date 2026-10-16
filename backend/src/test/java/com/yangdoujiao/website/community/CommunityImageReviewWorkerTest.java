package com.yangdoujiao.website.community;

import java.time.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;

class CommunityImageReviewWorkerTest {
    private final Instant now=Instant.parse("2026-10-16T02:40:00Z");
    private final Clock clock=Clock.fixed(now,ZoneOffset.UTC);
    private final CommunityImageReviewJobs jobs=mock(CommunityImageReviewJobs.class);
    private final CommunityImageAttachments images=mock(CommunityImageAttachments.class);
    private final WechatImageReviewGateway gateway=mock(WechatImageReviewGateway.class);
    private final WechatDirectImageReviewGateway direct=mock(WechatDirectImageReviewGateway.class);

    @Test void clearDirectVerdictCompletesFirstAttemptWithoutStartingAsyncReview() {
        var claim=new CommunityImageReviewJobs.Claim("image-1",42L,"lease-1",1,false);
        when(jobs.claim(now)).thenReturn(Optional.of(claim),Optional.empty());
        when(direct.check("image-1")).thenReturn(Optional.of("PASS"));

        new CommunityImageReviewWorker(jobs,images,gateway,direct,clock).tick();

        verify(jobs).completeDirect(claim,"PASS",now);
        verifyNoInteractions(gateway);
        verify(images).reconcile();
    }

    @Test void unavailableDirectCheckFallsBackToAsyncUrlReview() {
        var claim=new CommunityImageReviewJobs.Claim("image-2",43L,"lease-2",1,false);
        when(jobs.claim(now)).thenReturn(Optional.of(claim),Optional.empty());
        when(direct.check("image-2")).thenReturn(Optional.empty());
        when(gateway.submit(43L,"image-2")).thenReturn(Optional.of("trace-2"));

        new CommunityImageReviewWorker(jobs,images,gateway,direct,clock).tick();

        verify(jobs).acknowledge(claim,"trace-2",now);
        verify(jobs,never()).completeDirect(any(),anyString(),any());
        verify(images).reconcile();
    }
}
