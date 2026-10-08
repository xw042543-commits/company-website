package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.account.UserAccountRole;
import com.yangdoujiao.website.auth.session.UserPrincipal;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class AdviserConsultationStatusPersistenceIntegrationTest {
    @Autowired private JdbcTemplate jdbc;
    @Autowired private MockMvc mvc;
    private UUID reference;
    private UserPrincipal adviser;

    @BeforeEach
    void fixture() {
        Long actor = jdbc.queryForObject("""
                INSERT INTO user_accounts (full_name, role, status, agreement_version, privacy_version, created_at, updated_at)
                VALUES ('Adviser status fixture', 'ADVISER', 'ACTIVE', 'terms-v1', 'privacy-v1', NOW(), NOW()) RETURNING id
                """, Long.class);
        UserAccount account = UserAccount.external("Adviser status fixture", "terms-v1", "privacy-v1");
        ReflectionTestUtils.setField(account, "id", actor);
        ReflectionTestUtils.setField(account, "role", UserAccountRole.ADVISER);
        adviser = UserPrincipal.from(account);
        reference = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO consultation_enquiries (reference_code, name, contact, intended_school, intended_course,
                    qualification, notes, locale, privacy_consent, privacy_notice_version, status, created_at,
                    status_updated_at)
                VALUES (?, ' Lim 林 ', 'private@example.test', 'School 私立', 'Course 课程', 'bachelor',
                    'Unchanged\n私密 notes', 'en', TRUE, 'privacy-v1', 'NEW', ?, ?)
                """, reference, OffsetDateTime.parse("2026-10-06T09:00:00Z"),
                OffsetDateTime.parse("2026-10-06T09:00:00Z"));
    }

    @Test
    void realGuardedUpdatePreservesEverySourceByteAndRejectsStaleRetry() throws Exception {
        byte[] before = sourceBytes();
        update("IN_PROGRESS", 0).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(1));
        assertThat(sourceBytes()).isEqualTo(before);
        assertThat(jdbc.queryForObject("SELECT status_updated_by_user_id FROM consultation_enquiries WHERE reference_code = ?",
                Long.class, reference)).isEqualTo(adviser.userId());
        assertThat(jdbc.queryForObject("SELECT status_updated_at FROM consultation_enquiries WHERE reference_code = ?",
                OffsetDateTime.class, reference).getOffset()).isEqualTo(java.time.ZoneOffset.UTC);
        update("COMPLETED", 0).andExpect(status().isConflict());
        assertThat(jdbc.queryForObject("SELECT status FROM consultation_enquiries WHERE reference_code = ?",
                String.class, reference)).isEqualTo("IN_PROGRESS");
        update("IN_PROGRESS", 1).andExpect(status().isOk()).andExpect(jsonPath("$.version").value(2));
        assertThat(sourceBytes()).isEqualTo(before);
        assertThat(jdbc.queryForObject("SELECT version FROM consultation_enquiries WHERE reference_code = ?",
                Long.class, reference)).isEqualTo(2L);
    }

    private org.springframework.test.web.servlet.ResultActions update(String status, long version) throws Exception {
        return mvc.perform(patch("/api/v1/adviser/consultations/" + reference + "/status")
                .with(user(adviser)).with(csrf()).contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"" + status + "\",\"version\":" + version + "}"));
    }

    private byte[] sourceBytes() {
        return jdbc.queryForObject("""
                SELECT convert_to(jsonb_build_array(id, reference_code, name, contact, intended_school,
                    intended_course, qualification, notes, locale, privacy_consent, privacy_notice_version,
                    created_at)::text, 'UTF8') FROM consultation_enquiries WHERE reference_code = ?
                """, byte[].class, reference);
    }
}
