package com.yangdoujiao.website.community;

import com.yangdoujiao.website.community.media.CommunityImageStorage;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class CommunityImageCleanupRepository {
    private final JdbcTemplate jdbc;
    public CommunityImageCleanupRepository(JdbcTemplate jdbc) { this.jdbc=jdbc; }
    private record Expired(String id,String key,long bytes) {}
    /** Same lock as binding: a cleanup cannot race a successful attachment. */
    @Transactional
    public int expireUnbound(Instant now,CommunityImageStorage storage) {
        jdbc.queryForObject("SELECT used_bytes FROM community_image_capacity WHERE id=1 FOR UPDATE",Long.class);
        var expired=jdbc.query("SELECT id,storage_key,byte_size FROM community_images WHERE post_id IS NULL AND created_at<? ORDER BY created_at LIMIT 100",
            (rs,row)->new Expired(rs.getString(1),rs.getString(2),rs.getLong(3)),OffsetDateTime.ofInstant(now.minusSeconds(86400),ZoneOffset.UTC));
        for(var image:expired) {
            try { storage.delete(image.key()); } catch(IOException e) { throw new UncheckedIOException("Private image cleanup failed",e); }
            jdbc.update("DELETE FROM community_images WHERE id=? AND post_id IS NULL",image.id());
            jdbc.update("UPDATE community_image_capacity SET used_bytes=GREATEST(0,used_bytes-?) WHERE id=1",image.bytes());
        }
        jdbc.update("DELETE FROM community_image_callback_inbox WHERE received_at<?",OffsetDateTime.ofInstant(now.minusSeconds(7*86400),ZoneOffset.UTC));
        return expired.size();
    }
}
