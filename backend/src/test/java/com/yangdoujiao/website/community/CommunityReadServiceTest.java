package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import com.yangdoujiao.website.auth.external.UserExternalIdentityRepository;
import tools.jackson.databind.json.JsonMapper;

class CommunityReadServiceTest {
    @Test
    void hotContinuesPastBoundaryHiddenBetweenRankingAndContentQueries() {
        var time = OffsetDateTime.parse("2026-10-07T00:00:00Z");
        Clock clock = Clock.fixed(Instant.parse("2026-10-08T00:00:00Z"), ZoneOffset.UTC);
        var posts = mock(CommunityPostRepository.class);
        var profiles = mock(UserExternalIdentityRepository.class);
        var codec = new CommunityCursorCodec(JsonMapper.builder().build(), clock, "test-community-cursor-secret-32-bytes");
        var snapshots = mock(CommunityHotSnapshotCache.class);
        var service = new CommunityReadService(posts, mock(CommunityCommentRepository.class),
                mock(CommunityReactionRepository.class), profiles, codec, snapshots);
        var visible = CommunityPost.create(10L, "visible", CommunityContentStatus.PUBLISHED, null, time);
        var hidden = CommunityPost.create(10L, "hidden", CommunityContentStatus.PUBLISHED, null, time);
        ReflectionTestUtils.setField(visible, "id", 1L);
        ReflectionTestUtils.setField(hidden, "id", 2L);
        hidden.changeStatus(CommunityContentStatus.HIDDEN, time.plusHours(1));
        String cursor = codec.encodeHot("b2ced83c-214b-42e4-9f73-87e2357a8e20", 2, OffsetDateTime.now(clock).plusSeconds(45));
        when(snapshots.page(null, 2)).thenReturn(new CommunityHotSnapshotCache.SnapshotPage(List.of(1L, 2L), cursor));
        when(posts.findAllById(List.of(1L, 2L))).thenReturn(List.of(visible, hidden));
        when(profiles.findProfilesByAccountIds(List.of(10L))).thenReturn(List.of());

        var result = service.list("hot", null, 2, null);
        assertThat(result.items()).extracting(CommunityPostSummary::id).containsExactly("1");
        assertThat(result.nextCursor()).isNotNull();
        assertThat(codec.decodeHot(result.nextCursor()).nextOffset()).isEqualTo(2);
    }
}
