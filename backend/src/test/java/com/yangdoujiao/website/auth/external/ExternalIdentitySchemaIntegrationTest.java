package com.yangdoujiao.website.auth.external;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

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
class ExternalIdentitySchemaIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @AfterEach
    void deleteFixtures() {
        jdbc.update("""
                DELETE FROM user_external_identities
                WHERE user_account_id IN (
                    SELECT id FROM user_accounts
                    WHERE normalized_email LIKE 'wechat-schema-%@example.test'
                )
                """);
        jdbc.update("DELETE FROM user_accounts WHERE normalized_email LIKE 'wechat-schema-%@example.test'");
    }

    @Test
    void createsExternalIdentityTableWithoutChangingExistingAccounts() {
        long accountId = insertAccount("wechat-schema-existing@example.test");

        List<String> columns = jdbc.queryForList("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'user_external_identities'
                ORDER BY ordinal_position
                """, String.class);

        assertThat(columns).containsExactly(
                "id",
                "user_account_id",
                "provider",
                "provider_client_id",
                "provider_subject",
                "created_at",
                "last_login_at",
                "display_name",
                "avatar_url");
        assertThat(jdbc.queryForObject(
                "SELECT normalized_email FROM user_accounts WHERE id = ?",
                String.class,
                accountId)).isEqualTo("wechat-schema-existing@example.test");
    }

    @Test
    void rejectsUnsupportedProvidersBlankIdentifiersAndDuplicateBindings() {
        long firstAccount = insertAccount("wechat-schema-first@example.test");
        long secondAccount = insertAccount("wechat-schema-second@example.test");

        insertIdentity(firstAccount, "wechat-app", "wechat-subject");

        assertThatThrownBy(() -> insertIdentity(secondAccount, "wechat-app", "wechat-subject"))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertIdentity(firstAccount, "another-app", "another-subject"))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO user_external_identities (
                    user_account_id, provider, provider_client_id, provider_subject
                ) VALUES (?, 'GOOGLE', 'wechat-app', 'other-subject')
                """, secondAccount)).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO user_external_identities (
                    user_account_id, provider, provider_client_id, provider_subject
                ) VALUES (?, 'WECHAT', ' ', 'other-subject')
                """, secondAccount)).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO user_external_identities (
                    user_account_id, provider, provider_client_id, provider_subject
                ) VALUES (?, 'WECHAT', 'wechat-app', '')
                """, secondAccount)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void retainsBindingWhenAccountDeletionIsAttempted() {
        long accountId = insertAccount("wechat-schema-retained@example.test");
        insertIdentity(accountId, "wechat-app", "retained-subject");

        assertThatThrownBy(() -> jdbc.update("DELETE FROM user_accounts WHERE id = ?", accountId))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM user_external_identities WHERE user_account_id = ?",
                Integer.class,
                accountId)).isEqualTo(1);
    }

    private long insertAccount(String email) {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts (
                    full_name, normalized_email, password_hash, status,
                    agreement_version, privacy_version
                ) VALUES ('WeChat Schema Test', ?, 'test-only-hash', 'ACTIVE', 'terms-v1', 'privacy-v1')
                RETURNING id
                """, Long.class, email);
    }

    private void insertIdentity(long accountId, String clientId, String subject) {
        jdbc.update("""
                INSERT INTO user_external_identities (
                    user_account_id, provider, provider_client_id, provider_subject
                ) VALUES (?, 'WECHAT', ?, ?)
                """, accountId, clientId, subject);
    }
}
