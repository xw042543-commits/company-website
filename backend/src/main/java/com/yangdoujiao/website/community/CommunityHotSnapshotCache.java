package com.yangdoujiao.website.community;

import java.time.Clock;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import com.yangdoujiao.website.common.exception.ApiException;
import tools.jackson.databind.ObjectMapper;

/** One shared derived ranking per 45-second lifetime. Content/visibility is always re-read from PostgreSQL. */
@Component
public class CommunityHotSnapshotCache {
    private static final String PREFIX = "community:hot:v1:";
    private static final Duration LIFETIME = Duration.ofSeconds(45);
    private static final int MAX_ROWS = 100000;
    private static final DefaultRedisScript<Long> PUBLISH_IF_OWNER = new DefaultRedisScript<>("""
            if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
            for first = 4, #ARGV, 1000 do
              redis.call('RPUSH', KEYS[2], unpack(ARGV, first, math.min(first + 999, #ARGV)))
            end
            if #ARGV > 3 then redis.call('PEXPIRE', KEYS[2], ARGV[3]) end
            redis.call('SET', KEYS[3], ARGV[2], 'PX', ARGV[3])
            redis.call('SET', KEYS[4], ARGV[1], 'PX', ARGV[3])
            return 1
            """, Long.class);
    private static final DefaultRedisScript<Long> RELEASE = new DefaultRedisScript<>("""
            if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end
            return 0
            """, Long.class);
    private final StringRedisTemplate redis;
    private final CommunityPostRepository posts;
    private final CommunityCursorCodec cursors;
    private final ObjectMapper json;
    private final Clock clock;
    private final CommunityMetrics metrics;

    public CommunityHotSnapshotCache(StringRedisTemplate redis, CommunityPostRepository posts,
            CommunityCursorCodec cursors, ObjectMapper json, Clock clock, CommunityMetrics metrics) {
        this.redis = redis;
        this.posts = posts;
        this.cursors = cursors;
        this.json = json;
        this.clock = clock;
        this.metrics = metrics;
    }

    public SnapshotPage page(String cursor, int size) {
        try {
            var position = cursor == null ? null : cursors.decodeHot(cursor);
            Manifest manifest = position == null ? current() : load(position.snapshotVersion());
            int offset = position == null ? 0 : position.nextOffset();
            if (offset >= manifest.count() && offset != 0) throw CommunityCursorCodec.expiredHot();
            int end = Math.min(offset + size, manifest.count());
            List<String> ids = end == offset ? List.of() : redis.opsForList().range(PREFIX + manifest.version() + ":ids", offset, end - 1);
            if (ids == null || ids.size() != end - offset) throw CommunityCursorCodec.expiredHot();
            String nextCursor = end < manifest.count() ? cursors.encodeHot(manifest.version(), end, manifest.expiresAt()) : null;
            return new SnapshotPage(ids.stream().map(Long::valueOf).toList(), nextCursor);
        } catch (DataAccessException exception) {
            metrics.redisUnavailable(CommunityMetrics.Command.HOT);
            throw unavailable();
        }
    }

    private Manifest current() {
        String current = redis.opsForValue().get(PREFIX + "current");
        Manifest existing = available(current);
        if (existing != null) return existing;
        String owner = UUID.randomUUID().toString();
        if (!Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(PREFIX + "building", owner, Duration.ofSeconds(10)))) throw unavailable();
        try {
            existing = available(redis.opsForValue().get(PREFIX + "current"));
            if (existing != null) return existing;
            OffsetDateTime snapshot = OffsetDateTime.now(clock);
            var ranked = posts.findHotRanking(snapshot, PageRequest.of(0, MAX_ROWS + 1));
            if (ranked.size() > MAX_ROWS) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "COMMUNITY_HOT_SNAPSHOT_TOO_LARGE", "Hot feed exceeds its snapshot capacity");
            List<String> ids = ranked.stream().map(row -> row.getId().toString()).toList();
            Manifest manifest = new Manifest(owner, ids.size(), OffsetDateTime.now(clock).plus(LIFETIME));
            if (publish(manifest, ids)) return manifest;
            // The lease expired while PostgreSQL was ranking. Never publish stale data or reacquire recursively.
            // One bounded lookup may use the winner; if it is still building/missing, the client retries later.
            Manifest winner = available(redis.opsForValue().get(PREFIX + "current"));
            if (winner != null) return winner;
            throw unavailable();
        } finally {
            redis.execute(RELEASE, List.of(PREFIX + "building"), owner);
        }
    }

    private boolean publish(Manifest manifest, List<String> ids) {
        java.util.ArrayList<String> arguments = new java.util.ArrayList<>(ids.size() + 3);
        arguments.add(manifest.version());
        arguments.add(json.writeValueAsString(manifest));
        arguments.add(Long.toString(LIFETIME.toMillis()));
        arguments.addAll(ids);
        // Ownership check, complete order, TTLs, metadata and current version are one atomic Redis operation.
        // Chunked RPUSH avoids Lua unpack's argument limit without exposing a partially published list.
        Long published = redis.execute(PUBLISH_IF_OWNER, List.of(PREFIX + "building",
                PREFIX + manifest.version() + ":ids", PREFIX + manifest.version() + ":manifest", PREFIX + "current"),
                arguments.toArray());
        return Long.valueOf(1).equals(published);
    }

    private Manifest available(String version) {
        if (version == null) return null;
        try { return load(version); }
        catch (ApiException exception) {
            if ("COMMUNITY_HOT_SNAPSHOT_EXPIRED".equals(exception.getCode())) return null;
            throw exception;
        }
    }

    private Manifest load(String version) {
        String value = redis.opsForValue().get(PREFIX + version + ":manifest");
        if (value == null) throw CommunityCursorCodec.expiredHot();
        Manifest manifest = json.readValue(value, Manifest.class);
        if (!manifest.expiresAt().isAfter(OffsetDateTime.now(clock))) throw CommunityCursorCodec.expiredHot();
        if (manifest.count() > 0 && !Boolean.TRUE.equals(redis.hasKey(PREFIX + version + ":ids"))) throw CommunityCursorCodec.expiredHot();
        return manifest;
    }

    private static ApiException unavailable() {
        return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "COMMUNITY_HOT_SNAPSHOT_UNAVAILABLE",
                "Hot feed snapshot is temporarily unavailable; retry later");
    }

    private record Manifest(String version, int count, OffsetDateTime expiresAt) {}
    public record SnapshotPage(List<Long> ids, String nextCursor) {}
}
