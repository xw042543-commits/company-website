package com.yangdoujiao.website.auth.miniapp;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class MiniappAvatarRepository {
    private final NamedParameterJdbcTemplate jdbc;

    public MiniappAvatarRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void save(long accountId, String contentType, byte[] content) {
        jdbc.update("""
                INSERT INTO miniapp_account_avatars(user_account_id, content_type, content, updated_at)
                VALUES (:accountId, :contentType, :content, CURRENT_TIMESTAMP)
                ON CONFLICT(user_account_id) DO UPDATE SET
                  content_type=EXCLUDED.content_type, content=EXCLUDED.content, updated_at=CURRENT_TIMESTAMP
                """, Map.of("accountId", accountId, "contentType", contentType, "content", content));
    }

    public Optional<StoredAvatar> find(long accountId) {
        return jdbc.query("""
                SELECT content_type, content, updated_at
                FROM miniapp_account_avatars WHERE user_account_id=:accountId
                """, Map.of("accountId", accountId), (row, number) -> new StoredAvatar(
                        row.getString("content_type"), row.getBytes("content"),
                        row.getObject("updated_at", OffsetDateTime.class)))
                .stream().findFirst();
    }

    public record StoredAvatar(String contentType, byte[] content, OffsetDateTime updatedAt) {}
}
