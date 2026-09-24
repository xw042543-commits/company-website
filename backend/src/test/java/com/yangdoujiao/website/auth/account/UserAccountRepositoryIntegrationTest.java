package com.yangdoujiao.website.auth.account;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class UserAccountRepositoryIntegrationTest {
    @Autowired private UserAccountRepository repository;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void findsActiveEmailAndPhoneWithoutReturningDeletedAccounts() {
        insert("active@example.com", null, "ACTIVE");
        insert(null, "+60123456789", "PENDING_VERIFICATION");
        insert("deleted@example.com", null, "DELETED");
        insert(null, "+60123456788", "DELETED");

        assertThat(repository.findLoginAccount("active@example.com")).get()
                .extracting(UserAccount::getStatus).isEqualTo(UserAccountStatus.ACTIVE);
        assertThat(repository.findLoginAccount("+60123456789")).get()
                .extracting(UserAccount::getStatus).isEqualTo(UserAccountStatus.PENDING_VERIFICATION);
        assertThat(repository.findLoginAccount("deleted@example.com")).isEmpty();
        assertThat(repository.findLoginAccount("+60123456788")).isEmpty();
    }

    private void insert(String email, String phone, String status) {
        jdbc.update("""
                INSERT INTO user_accounts (full_name, normalized_email, normalized_phone, password_hash,
                    status, agreement_version, privacy_version, deleted_at)
                VALUES ('Test User', ?, ?, 'hash', ?, 'terms-v1', 'privacy-v1',
                    CASE WHEN ? = 'DELETED' THEN CURRENT_TIMESTAMP ELSE NULL END)
                """, email, phone, status, status);
    }
}
