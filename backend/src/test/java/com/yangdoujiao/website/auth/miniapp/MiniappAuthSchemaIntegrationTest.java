package com.yangdoujiao.website.auth.miniapp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class MiniappAuthSchemaIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @AfterEach
    void deleteFixtures() {
        jdbc.update("""
                DELETE FROM miniapp_auth_tokens
                WHERE user_account_id IN (
                    SELECT id FROM user_accounts WHERE full_name = 'Miniapp Schema Test'
                )
                """);
        jdbc.update("DELETE FROM user_external_identities WHERE provider_client_id = 'miniapp-schema-client'");
        jdbc.update("DELETE FROM user_accounts WHERE full_name = 'Miniapp Schema Test'");
    }

    @Test
    void createsTokenTableWithRequiredColumns() {
        List<String> columns = jdbc.queryForList("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'miniapp_auth_tokens'
                ORDER BY ordinal_position
                """, String.class);

        assertThat(columns).containsExactly(
                "id", "user_account_id", "token_hash", "token_kind", "family_id",
                "expires_at", "revoked_at", "replaced_by_hash", "created_at");
    }

    @Test
    void acceptsMiniappIdentityWithoutChangingWebsiteIdentityProvider() {
        long first = insertAccount();
        long second = insertAccount();

        jdbc.update("""
                INSERT INTO user_external_identities
                    (user_account_id, provider, provider_client_id, provider_subject)
                VALUES (?, 'WECHAT_MINI_PROGRAM', 'miniapp-schema-client', 'miniapp-subject')
                """, first);
        jdbc.update("""
                INSERT INTO user_external_identities
                    (user_account_id, provider, provider_client_id, provider_subject)
                VALUES (?, 'WECHAT', 'miniapp-schema-client', 'website-subject')
                """, second);

        assertThat(jdbc.queryForObject("""
                SELECT COUNT(*) FROM user_external_identities
                WHERE provider IN ('WECHAT', 'WECHAT_MINI_PROGRAM')
                  AND provider_client_id = 'miniapp-schema-client'
                """, Integer.class)).isEqualTo(2);
    }

    @Test
    void enforcesUniqueHashesTokenKindsAndAccountForeignKey() {
        long accountId = insertAccount();
        String tokenHash = "a".repeat(64);
        insertToken(accountId, tokenHash, "ACCESS");

        assertThatThrownBy(() -> insertToken(accountId, tokenHash, "REFRESH"))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertToken(accountId, "b".repeat(64), "COOKIE"))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertToken(Long.MAX_VALUE, "c".repeat(64), "ACCESS"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private long insertAccount() {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts (
                    full_name, password_hash, status, agreement_version, privacy_version
                ) VALUES ('Miniapp Schema Test', NULL, 'ACTIVE', 'terms-v1', 'privacy-v1')
                RETURNING id
                """, Long.class);
    }

    private void insertToken(long accountId, String hash, String kind) {
        jdbc.update("""
                INSERT INTO miniapp_auth_tokens (
                    user_account_id, token_hash, token_kind, family_id, expires_at
                ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP + INTERVAL '15 minutes')
                """, accountId, hash, kind, UUID.randomUUID());
    }
}
