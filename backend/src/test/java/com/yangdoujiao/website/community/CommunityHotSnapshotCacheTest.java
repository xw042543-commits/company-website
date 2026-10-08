package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.time.Clock;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.RedisConnectionFailureException;
import com.yangdoujiao.website.common.exception.ApiException;
import tools.jackson.databind.json.JsonMapper;

class CommunityHotSnapshotCacheTest {
    @Test
    void redisOutageFailsExplicitlyRatherThanRecomputingChangedRankForEitherPage() {
        var redis = mock(StringRedisTemplate.class);
        when(redis.opsForValue()).thenThrow(new RedisConnectionFailureException("offline"));
        var json = JsonMapper.builder().build();
        Clock clock = Clock.systemUTC();
        var codec = new CommunityCursorCodec(json, clock, "test-shared-community-cursor-key-32-bytes");
        var cache = new CommunityHotSnapshotCache(redis, mock(CommunityPostRepository.class), codec, json, clock);
        String continuation = codec.encodeHot("b2ced83c-214b-42e4-9f73-87e2357a8e20", 1, OffsetDateTime.now(clock).plusSeconds(45));
        for (String cursor : new String[] { null, continuation }) {
            assertThatThrownBy(() -> cache.page(cursor, 20)).isInstanceOfSatisfying(ApiException.class,
                    error -> assertThat(error.getCode()).isEqualTo("COMMUNITY_HOT_SNAPSHOT_UNAVAILABLE"));
        }
    }
}
