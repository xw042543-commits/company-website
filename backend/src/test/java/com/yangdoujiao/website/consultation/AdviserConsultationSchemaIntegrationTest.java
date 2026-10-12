package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.OffsetDateTime;
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
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRole;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
class AdviserConsultationSchemaIntegrationTest {

    @Autowired private JdbcTemplate jdbc;

    @AfterEach
    void deleteFixtures() {
        jdbc.update("DELETE FROM consultation_enquiries WHERE contact = 'adviser-schema-contact'");
        jdbc.update("DELETE FROM user_accounts WHERE normalized_email = 'adviser-schema@example.test'");
    }

    @Test
    void existingAccountsDefaultToUserAndAdviserIsAllowed() {
        Long id = insertAccount();
        assertThat(jdbc.queryForObject("SELECT role FROM user_accounts WHERE id = ?", String.class, id))
                .isEqualTo("USER");
        assertThat(jdbc.update("UPDATE user_accounts SET role = 'ADVISER' WHERE id = ?", id)).isEqualTo(1);
        assertThatThrownBy(() -> jdbc.update("UPDATE user_accounts SET role = 'ADMIN' WHERE id = ?", id))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE user_accounts SET role = NULL WHERE id = ?", id))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void consultationWorkflowColumnsAcceptOnlySupportedStates() {
        Long id = insertEnquiry();
        assertThat(jdbc.queryForObject("SELECT status FROM consultation_enquiries WHERE id = ?", String.class, id))
                .isEqualTo("NEW");
        assertThat(jdbc.queryForObject("SELECT version FROM consultation_enquiries WHERE id = ?", Long.class, id))
                .isZero();
        assertThat(jdbc.update("UPDATE consultation_enquiries SET status = 'IN_PROGRESS' WHERE id = ?", id)).isEqualTo(1);
        assertThat(jdbc.update("UPDATE consultation_enquiries SET status = 'COMPLETED' WHERE id = ?", id)).isEqualTo(1);
        assertThatThrownBy(() -> jdbc.update("UPDATE consultation_enquiries SET status = 'DELETED' WHERE id = ?", id))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE consultation_enquiries SET status_updated_at = NULL WHERE id = ?", id))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update("UPDATE consultation_enquiries SET version = NULL WHERE id = ?", id))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void statusUpdaterMustReferenceAnAccountAndPreventsItsDeletion() {
        Long accountId = insertAccount();
        Long enquiryId = insertEnquiry();
        assertThat(jdbc.update("UPDATE consultation_enquiries SET status_updated_by_user_id = ? WHERE id = ?",
                accountId, enquiryId)).isEqualTo(1);
        assertThatThrownBy(() -> jdbc.update("DELETE FROM user_accounts WHERE id = ?", accountId))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update(
                "UPDATE consultation_enquiries SET status_updated_by_user_id = -1 WHERE id = ?", enquiryId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void workflowColumnsAndListIndexUsePostgresTypesAndOrdering() {
        assertThat(jdbc.queryForList("""
                SELECT column_name FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'consultation_enquiries'
                  AND ((column_name = 'status_updated_at' AND data_type = 'timestamp with time zone' AND is_nullable = 'NO')
                    OR (column_name = 'status_updated_by_user_id' AND data_type = 'bigint' AND is_nullable = 'YES')
                    OR (column_name = 'version' AND data_type = 'bigint' AND is_nullable = 'NO'))
                """, String.class)).containsExactlyInAnyOrder("status_updated_at", "status_updated_by_user_id", "version");
        assertThat(jdbc.queryForObject("""
                SELECT indexdef FROM pg_indexes
                WHERE schemaname = 'public' AND indexname = 'idx_consultation_enquiries_status_created'
                """, String.class)).contains("(status, created_at DESC, id DESC)");
    }

    private Long insertAccount() {
        return jdbc.queryForObject("""
                INSERT INTO user_accounts (
                    full_name, normalized_email, password_hash, status,
                    agreement_version, privacy_version, created_at, updated_at
                ) VALUES ('Adviser schema', 'adviser-schema@example.test', 'hash', 'ACTIVE',
                          'terms-v1', 'privacy-v1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id
                """, Long.class);
    }

    private Long insertEnquiry() {
        return jdbc.queryForObject("""
                INSERT INTO consultation_enquiries (
                    reference_code, name, contact, locale, privacy_consent, privacy_notice_version, status_updated_at
                ) VALUES (gen_random_uuid(), 'Adviser schema', 'adviser-schema-contact', 'zh', TRUE, 'privacy-v1',
                          CURRENT_TIMESTAMP)
                RETURNING id
                """, Long.class);
    }
}

// Constructor contracts are also runnable on developer machines without Docker.
class AdviserConsultationEntityDefaultsTest {

    @Test
    void passwordAccountsStartWithUserRole() {
        UserAccount account = new UserAccount("Test user", "test@example.test", null, "hash", "terms-v1", "privacy-v1");
        assertThat(account.getRole()).isEqualTo(UserAccountRole.USER);
    }

    @Test
    void externalAccountsStartWithUserRole() {
        assertThat(UserAccount.external("External user", "terms-v1", "privacy-v1").getRole())
                .isEqualTo(UserAccountRole.USER);
    }

    @Test
    void newEnquiriesStartWithTheirSubmissionTimestampAndNoStatusUpdater() {
        OffsetDateTime submittedAt = OffsetDateTime.parse("2026-10-06T09:00:00Z");
        ConsultationEnquiry enquiry = new ConsultationEnquiry(UUID.randomUUID(), "Test user", "contact",
                null, null, null, null, "zh", "privacy-v1", submittedAt);
        assertThat(enquiry.getStatus()).isEqualTo(ConsultationStatus.NEW);
        assertThat(enquiry.getStatusUpdatedAt()).isEqualTo(submittedAt);
        assertThat(enquiry.getStatusUpdatedByUserId()).isNull();
        assertThat(enquiry.getVersion()).isZero();
    }
}
