package com.yangdoujiao.website.planningagent.evidence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.TestContainersConfiguration;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration.class)
@Transactional
class EvidenceSchemaIntegrationTest {
    @Autowired private JdbcTemplate jdbc;
    private long programme;

    @BeforeEach
    void createDraftProgramme() {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        long category = jdbc.queryForObject("INSERT INTO subject_categories(code,name_en) VALUES(?, 'Evidence category') RETURNING id",
                Long.class, "E_" + suffix.toUpperCase());
        long university = jdbc.queryForObject("INSERT INTO universities(name,slug,country) VALUES('Evidence school',?,'Malaysia') RETURNING id",
                Long.class, "evidence-" + suffix);
        programme = jdbc.queryForObject("INSERT INTO programmes(programme_code,university_id,subject_category_id,slug,name_en) VALUES(?,?,?,?,'Evidence programme') RETURNING id",
                Long.class, "E_" + suffix.toUpperCase(), university, category, "evidence-" + suffix);
    }

    @Test
    void repositoryReadsPersistedEvidenceWithoutPublishingProgramme() {
        long id = insert(programme, "VERIFIED");
        var repository = new EvidenceRepository(jdbc);

        assertThat(repository.findByProgrammeId(programme)).containsExactly(new Evidence(
                id, programme, "ADMISSIONS", "https://example.edu/admissions", "OFFICIAL",
                "CN_MAINLAND", "2027-02", Instant.parse("2026-10-15T00:00:00Z"),
                Instant.parse("2026-11-01T00:00:00Z"),
                "VERIFIED", 3L, "Official requirements", false));
        assertThat(repository.findByProgrammeId(-1)).isEmpty();
        assertThat(jdbc.queryForObject("SELECT status FROM programmes WHERE id=?", String.class, programme))
                .isEqualTo("DRAFT");
        assertThat(jdbc.queryForObject("SELECT published_at FROM programmes WHERE id=?", Object.class, programme))
                .isNull();
    }

    @Test
    void repositoryPreservesUnknownOptionalFieldsAndConflict() {
        jdbc.update("""
                INSERT INTO planning_evidence(programme_id,fact_type,source_type,student_scope,review_status,excerpt,conflict)
                VALUES(?,'ADMISSIONS','ai_generated','CN_MAINLAND','DRAFT','Unreviewed text',true)
                """, programme);
        var evidence = new EvidenceRepository(jdbc).findByProgrammeId(programme).getFirst();
        assertThat(evidence.sourceUrl()).isNull();
        assertThat(evidence.intake()).isNull();
        assertThat(evidence.checkedAt()).isNull();
        assertThat(evidence.expiresAt()).isNull();
        assertThat(evidence.reviewerId()).isNull();
        assertThat(evidence.conflict()).isTrue();
        assertThat(new EvidencePolicy().assess(evidence, Instant.parse("2026-10-15T00:00:00Z"), "2027-02"))
                .isEqualTo(EvidenceState.REVIEW_REQUIRED);
    }

    @Test
    void rejectsEvidenceForMissingProgramme() {
        assertThatThrownBy(() -> insert(-1, "DRAFT")).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsUnknownReviewStatus() {
        assertThatThrownBy(() -> insert(programme, "PUBLISHED")).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void evidenceWritesRollBackWithTransaction() {
        jdbc.execute((ConnectionCallback<Void>) connection -> {
            var savepoint = connection.setSavepoint();
            insert(programme, "DRAFT");
            assertThat(new EvidenceRepository(jdbc).findByProgrammeId(programme)).hasSize(1);
            connection.rollback(savepoint);
            return null;
        });
        assertThat(new EvidenceRepository(jdbc).findByProgrammeId(programme)).isEmpty();
    }

    private long insert(long programmeId, String status) {
        return jdbc.queryForObject("""
                INSERT INTO planning_evidence(programme_id,fact_type,source_url,source_type,student_scope,
                    intake,checked_at,expires_at,review_status,reviewer_id,excerpt)
                VALUES(?,'ADMISSIONS','https://example.edu/admissions','OFFICIAL','CN_MAINLAND',
                    '2027-02',TIMESTAMPTZ '2026-10-15T00:00:00Z',TIMESTAMPTZ '2026-11-01T00:00:00Z',
                    ?,3,'Official requirements') RETURNING id
                """, Long.class, programmeId, status);
    }
}
