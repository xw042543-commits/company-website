package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

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
class ConsultationSchemaIntegrationTest {

    @Autowired private JdbcTemplate jdbc;

    @Test
    void databaseRejectsEnquiriesWithoutConsentOrWithUnknownStatus() {
        assertThatThrownBy(() -> insert(false, "NEW"))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> insert(true, "UNKNOWN"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private void insert(boolean consent, String status) {
        jdbc.update("""
                INSERT INTO consultation_enquiries (
                    reference_code, name, contact, locale,
                    privacy_consent, privacy_notice_version, status
                ) VALUES (
                    gen_random_uuid(), 'Schema Test', 'schema-test-contact', 'zh',
                    ?, 'test-v1', ?
                )
                """, consent, status);
    }
}
