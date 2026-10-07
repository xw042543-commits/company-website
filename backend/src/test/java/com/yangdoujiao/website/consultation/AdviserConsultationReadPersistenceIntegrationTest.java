package com.yangdoujiao.website.consultation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class AdviserConsultationReadPersistenceIntegrationTest {
    @Autowired private AdviserConsultationService service;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private MockMvc mockMvc;
    private UUID both;
    private UUID queryOnly;
    private UUID statusOnly;

    @BeforeEach
    void fixtures() {
        // Transaction rollback restores any pre-existing rows after each test.
        jdbc.update("DELETE FROM consultation_enquiries");
        statusOnly = insert("Other", "contact-other", "NEW", "2026-10-06T08:00:00Z");
        queryOnly = insert("lIm query-only", "contact-query", "COMPLETED", "2026-10-06T09:00:00Z");
        both = insert("Lim both", "contact-both", "NEW", "2026-10-06T09:00:00Z");
    }

    @Test
    void bothFiltersUseAndAndPaginationTotalSharesContentPredicate() {
        AdviserConsultationPage filtered = service.list(0, 1, ConsultationStatus.NEW, " LiM ");
        assertThat(filtered.items()).extracting(AdviserConsultationSummary::referenceCode).containsExactly(both);
        assertThat(filtered.totalElements()).isEqualTo(1);
        assertThat(filtered.totalPages()).isEqualTo(1);
        assertThat(filtered.counts()).isEqualTo(new ConsultationStatusCounts(2, 0, 1));
        AdviserConsultationPage next = service.list(1, 1, ConsultationStatus.NEW, "Lim");
        assertThat(next.items()).isEmpty();
        assertThat(next.totalElements()).isEqualTo(1);
    }

    @Test
    void sortsByCreatedAtThenIdAndSearchesNameContactAndExactReference() {
        assertThat(service.list(0, 20, null, null).items())
                .extracting(AdviserConsultationSummary::referenceCode).containsExactly(both, queryOnly, statusOnly);
        assertThat(service.list(0, 20, null, "CONTACT-QUERY").items())
                .extracting(AdviserConsultationSummary::referenceCode).containsExactly(queryOnly);
        assertThat(service.list(0, 20, null, both.toString()).items())
                .extracting(AdviserConsultationSummary::referenceCode).containsExactly(both);
        assertThat(service.list(0, 20, null, both.toString().substring(0, 8)).items()).isEmpty();
        assertThat(service.list(0, 20, null, "　 ").totalElements()).isEqualTo(3);
        assertThat(service.list(0, 20, null, "%").items()).isEmpty();
        assertThat(service.list(0, 20, null, "_").items()).isEmpty();
    }

    @Test
    void protectedHttpPageUsesPersistedNewestFixture() throws Exception {
        mockMvc.perform(get("/api/v1/adviser/consultations").with(user("adviser").roles("ADVISER", "USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].referenceCode").value(both.toString()))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(20))
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    private UUID insert(String name, String contact, String status, String createdAt) {
        UUID reference = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO consultation_enquiries (reference_code, name, contact, locale, privacy_consent,
                    privacy_notice_version, status, created_at, status_updated_at)
                VALUES (?, ?, ?, 'en', TRUE, 'privacy-v1', ?, ?, ?)
                """, reference, name, contact, status, OffsetDateTime.parse(createdAt), OffsetDateTime.parse(createdAt));
        return reference;
    }
}
