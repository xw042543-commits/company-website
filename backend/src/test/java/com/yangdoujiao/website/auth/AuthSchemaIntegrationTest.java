package com.yangdoujiao.website.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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
class AuthSchemaIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @AfterEach
    void deleteFixtures() {
        jdbc.update("DELETE FROM user_accounts WHERE normalized_email LIKE 'auth-schema-%@example.test'");
        jdbc.update("DELETE FROM auth_rate_limit_buckets WHERE scope = 'auth-schema-test'");
        jdbc.update("DELETE FROM spring_session WHERE principal_name = 'auth-schema-test'");
    }

    @Test
    void rejectsAccountsWithoutContactAndDuplicateNormalizedEmailOrPhone() {
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO user_accounts (full_name, password_hash, status, agreement_version, privacy_version)
                VALUES ('Schema Test', 'test-only-hash', 'PENDING_VERIFICATION', 'terms-v1', 'privacy-v1')
                """)).isInstanceOf(DataIntegrityViolationException.class);

        insertAccount("auth-schema-first@example.test", "+60123456780");
        assertThatThrownBy(() -> insertAccount("auth-schema-first@example.test", null))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insertAccount("auth-schema-second@example.test", "+60123456780"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsInvalidAccountStatusAndIncompletePolicyOrDeletionState() {
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO user_accounts (full_name, normalized_email, password_hash, status, agreement_version, privacy_version)
                VALUES ('Schema Test', 'auth-schema-invalid@example.test', 'test-only-hash', 'UNKNOWN', 'terms-v1', 'privacy-v1')
                """)).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO user_accounts (full_name, normalized_email, password_hash, status, agreement_version)
                VALUES ('Schema Test', 'auth-schema-policy@example.test', 'test-only-hash', 'ACTIVE', 'terms-v1')
                """)).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO user_accounts (full_name, normalized_email, password_hash, status, agreement_version, privacy_version)
                VALUES ('Schema Test', 'auth-schema-deleted@example.test', 'test-only-hash', 'DELETED', 'terms-v1', 'privacy-v1')
                """)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void tokenTablesRequireHashAndCascadeWhenAccountIsRemoved() {
        long userId = insertAccount("auth-schema-tokens@example.test", null);
        String verificationHash = "a".repeat(64);
        String resetHash = "b".repeat(64);

        jdbc.update("""
                INSERT INTO user_verification_tokens (user_id, token_type, token_hash, expires_at)
                VALUES (?, 'EMAIL', ?, CURRENT_TIMESTAMP + INTERVAL '1 hour')
                """, userId, verificationHash);
        jdbc.update("""
                INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
                VALUES (?, ?, CURRENT_TIMESTAMP + INTERVAL '1 hour')
                """, userId, resetHash);

        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO user_verification_tokens (user_id, token_type, token_hash, expires_at)
                VALUES (?, 'EMAIL', 'short', CURRENT_TIMESTAMP + INTERVAL '1 hour')
                """, userId)).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
                VALUES (?, 'short', CURRENT_TIMESTAMP + INTERVAL '1 hour')
                """, userId)).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO user_verification_tokens (user_id, token_type, token_hash, expires_at, attempts)
                VALUES (?, 'EMAIL', ?, CURRENT_TIMESTAMP + INTERVAL '1 hour', -1)
                """, userId, "c".repeat(64))).isInstanceOf(DataIntegrityViolationException.class);

        jdbc.update("DELETE FROM user_accounts WHERE id = ?", userId);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM user_verification_tokens WHERE user_id = ?", Integer.class, userId))
                .isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM password_reset_tokens WHERE user_id = ?", Integer.class, userId))
                .isZero();
    }

    @Test
    void rateLimitBucketsUseCompositeKeyAndNonnegativeAttempts() {
        jdbc.update("""
                INSERT INTO auth_rate_limit_buckets (scope, subject_hash, attempts, expires_at)
                VALUES ('auth-schema-test', ?, 1, CURRENT_TIMESTAMP + INTERVAL '1 hour')
                """, "d".repeat(64));
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO auth_rate_limit_buckets (scope, subject_hash, attempts, expires_at)
                VALUES ('auth-schema-test', ?, 2, CURRENT_TIMESTAMP + INTERVAL '1 hour')
                """, "d".repeat(64))).isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO auth_rate_limit_buckets (scope, subject_hash, attempts, expires_at)
                VALUES ('auth-schema-test', ?, -1, CURRENT_TIMESTAMP + INTERVAL '1 hour')
                """, "e".repeat(64))).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void springSessionTablesUseDatabaseForeignKeysAndRequiredIndexes() {
        Integer foreignKeys = jdbc.queryForObject("""
                SELECT COUNT(*) FROM information_schema.table_constraints
                WHERE table_name = 'spring_session_attributes' AND constraint_type = 'FOREIGN KEY'
                """, Integer.class);
        assertThat(foreignKeys).isEqualTo(1);
        assertThat(jdbc.queryForList("""
                SELECT indexname FROM pg_indexes WHERE tablename = 'spring_session'
                """, String.class))
                .contains("spring_session_ix1", "spring_session_ix2", "spring_session_ix3");

        jdbc.update("""
                INSERT INTO spring_session (primary_id, session_id, creation_time, last_access_time,
                                            max_inactive_interval, expiry_time, principal_name)
                VALUES (?, ?, 1, 1, 3600, 3600001, 'auth-schema-test')
                """, "00000000-0000-0000-0000-000000000001", "00000000-0000-0000-0000-000000000002");
        jdbc.update("""
                INSERT INTO spring_session_attributes (session_primary_id, attribute_name, attribute_bytes)
                VALUES (?, 'test', decode('00', 'hex'))
                """, "00000000-0000-0000-0000-000000000001");
        jdbc.update("DELETE FROM spring_session WHERE principal_name = 'auth-schema-test'");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM spring_session_attributes WHERE attribute_name = 'test'", Integer.class))
                .isZero();
    }

    private long insertAccount(String email, String phone) {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts (
                    full_name, normalized_email, normalized_phone, password_hash, status,
                    agreement_version, privacy_version
                ) VALUES ('Schema Test', ?, ?, 'test-only-hash', 'PENDING_VERIFICATION', 'terms-v1', 'privacy-v1')
                RETURNING id
                """, Long.class, email, phone);
    }
}
