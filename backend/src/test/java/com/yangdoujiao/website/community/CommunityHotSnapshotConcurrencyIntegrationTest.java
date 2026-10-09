package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.common.exception.ApiException;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class CommunityHotSnapshotConcurrencyIntegrationTest {
    private static final String PREFIX = "community:hot:v1:";
    @Autowired private StringRedisTemplate redis;
    @Autowired private ObjectMapper json;
    @Autowired private Clock clock;
    private CommunityCursorCodec codec;

    @BeforeEach
    void resetIsolatedCache() {
        var keys = redis.keys(PREFIX + "*");
        if (!keys.isEmpty()) redis.delete(keys);
        codec = new CommunityCursorCodec(json, clock, "test-shared-community-cursor-key-32-bytes");
    }

    @Test
    void staleBuilderCannotReplaceWinnerAfterCreationLeaseLoss() throws Exception {
        var entered = new CountDownLatch(1);
        var resume = new CountDownLatch(1);
        var aRepository = mock(CommunityPostRepository.class);
        when(aRepository.findHotRanking(any(), any())).thenAnswer(invocation -> {
            entered.countDown();
            if (!resume.await(5, TimeUnit.SECONDS)) throw new AssertionError("Builder A was not resumed");
            return ids(11L, 12L);
        });
        var bRepository = mock(CommunityPostRepository.class);
        when(bRepository.findHotRanking(any(), any())).thenReturn(ids(21L, 22L));
        var a = new CommunityHotSnapshotCache(redis, aRepository, codec, json, clock, mock(CommunityMetrics.class));
        var b = new CommunityHotSnapshotCache(redis, bRepository, codec, json, clock, mock(CommunityMetrics.class));

        try (var executor = Executors.newSingleThreadExecutor()) {
            var aResult = executor.submit(() -> a.page(null, 1));
            try {
                assertThat(entered.await(5, TimeUnit.SECONDS)).isTrue();
                String staleOwner = redis.opsForValue().get(PREFIX + "building");
                assertThat(staleOwner).isNotNull();
                // Exact deterministic simulation of A's lease expiry while its SQL query remains blocked.
                redis.delete(PREFIX + "building");
                var winner = b.page(null, 1);
                String winningVersion = codec.decodeHot(winner.nextCursor()).snapshotVersion();
                assertThat(winner.ids()).containsExactly(21L);
                assertThat(redis.opsForValue().get(PREFIX + "current")).isEqualTo(winningVersion);

                resume.countDown();
                var resumed = aResult.get(5, TimeUnit.SECONDS);
                assertThat(redis.opsForValue().get(PREFIX + "current")).isEqualTo(winningVersion);
                assertThat(resumed.ids()).containsExactly(21L);
                assertThat(codec.decodeHot(resumed.nextCursor()).snapshotVersion()).isEqualTo(winningVersion);
                assertThat(redis.keys(PREFIX + staleOwner + ":*")).isEmpty();
                assertThat(redis.getExpire(PREFIX + winningVersion + ":ids", TimeUnit.MILLISECONDS)).isBetween(30000L, 45000L);
                assertThat(redis.getExpire(PREFIX + winningVersion + ":manifest", TimeUnit.MILLISECONDS)).isBetween(30000L, 45000L);
                assertThat(redis.getExpire(PREFIX + "current", TimeUnit.MILLISECONDS)).isBetween(30000L, 45000L);
            } finally { resume.countDown(); }
        }
    }

    @Test
    void lostOwnershipWithoutAvailableWinnerFailsWithBoundedRetryError() {
        var repository = mock(CommunityPostRepository.class);
        when(repository.findHotRanking(any(), any())).thenAnswer(invocation -> {
            redis.delete(PREFIX + "building");
            return ids(11L, 12L);
        });
        var cache = new CommunityHotSnapshotCache(redis, repository, codec, json, clock, mock(CommunityMetrics.class));
        assertThatThrownBy(() -> cache.page(null, 1)).isInstanceOfSatisfying(ApiException.class,
                error -> assertThat(error.getCode()).isEqualTo("COMMUNITY_HOT_SNAPSHOT_UNAVAILABLE"));
        assertThat(redis.keys(PREFIX + "*")).isEmpty();
    }

    private static List<CommunityPostRepository.HotPosition> ids(Long... ids) {
        return java.util.Arrays.stream(ids).map(id -> (CommunityPostRepository.HotPosition) () -> id).toList();
    }
}
