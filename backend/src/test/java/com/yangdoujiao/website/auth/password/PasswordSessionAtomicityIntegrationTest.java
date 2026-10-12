package com.yangdoujiao.website.auth.password;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.verification.LocalAuthNotificationStore;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class PasswordSessionAtomicityIntegrationTest {
    private static final String OLD_PASSWORD = "correct-horse-42";
    private static final String NEW_PASSWORD = "new-correct-horse-84";

    @Autowired private PasswordService passwords;
    @Autowired private PasswordEncoder encoder;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private DataSource dataSource;
    @Autowired private PlatformTransactionManager manager;
    @Autowired private FindByIndexNameSessionRepository<? extends Session> sessions;
    @Autowired private LocalAuthNotificationStore notifications;

    @Test
    void resetRollbackAfterSessionRevocationRestoresPasswordTokenAndSessions() throws Exception {
        assertSharedDataSource();
        String email = email();
        long userId = account(email);
        passwords.forgotPassword(email, "en", "198.51.100.51");
        assertThat(notifications.awaitAvailable(email, Duration.ofSeconds(5))).isTrue();
        String token = notifications.take(email).orElseThrow().token();
        Session first = createIndexed(sessions, userId);
        Session second = createIndexed(sessions, userId);

        assertThatThrownBy(() -> new TransactionTemplate(manager).executeWithoutResult(status -> {
            passwords.resetPassword(token, NEW_PASSWORD, "198.51.100.52");
            assertThat(sessionCount(userId)).isZero();
            throw new IllegalStateException("injected after session revocation");
        })).isInstanceOf(IllegalStateException.class).hasMessage("injected after session revocation");

        assertThat(encoder.matches(OLD_PASSWORD, passwordHash(email))).isTrue();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM password_reset_tokens WHERE token_hash = ? "
                + "AND used_at IS NULL", Integer.class, AuthHash.sha256(token)))
                .isEqualTo(1);
        assertThat(sessions.findById(first.getId())).isNotNull();
        assertThat(sessions.findById(second.getId())).isNotNull();
    }

    @Test
    void changeRollbackAfterSessionRevocationRestoresPasswordTokenAndSessions() throws Exception {
        assertSharedDataSource();
        String email = email();
        long userId = account(email);
        passwords.forgotPassword(email, "en", "198.51.100.53");
        assertThat(notifications.awaitAvailable(email, Duration.ofSeconds(5))).isTrue();
        String token = notifications.take(email).orElseThrow().token();
        Session session = createIndexed(sessions, userId);

        assertThatThrownBy(() -> new TransactionTemplate(manager).executeWithoutResult(status -> {
            passwords.changePassword(userId, OLD_PASSWORD, NEW_PASSWORD, "198.51.100.54");
            assertThat(sessionCount(userId)).isZero();
            throw new IllegalStateException("injected after session revocation");
        })).isInstanceOf(IllegalStateException.class).hasMessage("injected after session revocation");

        assertThat(encoder.matches(OLD_PASSWORD, passwordHash(email))).isTrue();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM password_reset_tokens WHERE token_hash = ? "
                + "AND used_at IS NULL", Integer.class, AuthHash.sha256(token)))
                .isEqualTo(1);
        assertThat(sessions.findById(session.getId())).isNotNull();
    }

    private void assertSharedDataSource() {
        assertThat(manager).isInstanceOf(JpaTransactionManager.class);
        assertThat(((JpaTransactionManager) manager).getDataSource()).isSameAs(dataSource);
        assertThat(jdbc.getDataSource()).isSameAs(dataSource);
    }

    private long account(String email) {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts (full_name, normalized_email, password_hash, status,
                    agreement_version, privacy_version, created_at, updated_at)
                VALUES ('Password Test', ?, ?, 'ACTIVE', 'test-terms-v1', 'test-privacy-v1', ?, ?)
                RETURNING id
                """, Long.class, email, encoder.encode(OLD_PASSWORD), OffsetDateTime.now(), OffsetDateTime.now());
    }

    private String passwordHash(String email) {
        return jdbc.queryForObject("SELECT password_hash FROM user_accounts WHERE normalized_email = ?",
                String.class, email);
    }

    private int sessionCount(long userId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM spring_session WHERE principal_name = ?",
                Integer.class, "user:" + userId);
    }

    private <S extends Session> S createIndexed(FindByIndexNameSessionRepository<S> store, long userId) {
        S session = store.createSession();
        session.setAttribute(FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME, "user:" + userId);
        store.save(session);
        return session;
    }

    private String email() { return "rollback-reset-" + UUID.randomUUID() + "@example.com"; }
}
