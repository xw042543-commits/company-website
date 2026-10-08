package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
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
        var service = new CommunityReadService(posts, mock(CommunityCommentRepository.class),
                mock(CommunityReactionRepository.class), profiles, codec, clock);
        var visible = CommunityPost.create(10L, "visible", CommunityContentStatus.PUBLISHED, null, time);
        var hidden = CommunityPost.create(10L, "hidden", CommunityContentStatus.PUBLISHED, null, time);
        ReflectionTestUtils.setField(visible, "id", 1L);
        ReflectionTestUtils.setField(hidden, "id", 2L);
        hidden.changeStatus(CommunityContentStatus.HIDDEN, time.plusHours(1));
        when(posts.findHotAfter(any(), isNull(), any(), anyLong(), any())).thenReturn(List.of(
                boundary(1L, "3.0", time), boundary(2L, "2.0", time), boundary(3L, "1.0", time)));
        when(posts.findAllById(List.of(1L, 2L))).thenReturn(List.of(visible, hidden));
        when(profiles.findProfilesByAccountIds(List.of(10L))).thenReturn(List.of());

        var result = service.list("hot", null, 2, null);
        assertThat(result.items()).extracting(CommunityPostSummary::id).containsExactly("1");
        assertThat(result.nextCursor()).isNotNull();
        assertThat(codec.decode(result.nextCursor(), "hot").id()).isEqualTo(2L);
    }

    private CommunityPostRepository.HotPosition boundary(Long id, String score, OffsetDateTime time) {
        return new CommunityPostRepository.HotPosition() {
            public Long getId() { return id; }
            public BigDecimal getScore() { return new BigDecimal(score); }
            public Instant getPublishedAt() { return time.toInstant(); }
        };
    }
}
