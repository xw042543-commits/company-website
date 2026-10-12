package com.yangdoujiao.website.community.media;

import java.time.OffsetDateTime;
import org.springframework.jdbc.core.JdbcTemplate;

/** All mutations require the account lock followed by the capacity row lock. */
public final class CommunityImageRepository {
    private final JdbcTemplate jdbc;
    public CommunityImageRepository(JdbcTemplate jdbc) { this.jdbc=jdbc; }
    public long lockCapacity() {
        return jdbc.queryForObject("SELECT used_bytes FROM community_image_capacity WHERE id=1 FOR UPDATE",Long.class);
    }
    public long countSince(long owner, OffsetDateTime since) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM community_images WHERE owner_account_id=? AND created_at>=?",Long.class,owner,since);
    }
    public void insert(String id,long owner,String key,int width,int height,long bytes,OffsetDateTime now) {
        jdbc.update("INSERT INTO community_images(id,owner_account_id,storage_key,width,height,byte_size,status,created_at) VALUES(?,?,?,?,?,?,'PENDING',?)",
            id,owner,key,width,height,bytes,now);
        jdbc.update("UPDATE community_image_capacity SET used_bytes=used_bytes+? WHERE id=1",bytes);
    }
}
