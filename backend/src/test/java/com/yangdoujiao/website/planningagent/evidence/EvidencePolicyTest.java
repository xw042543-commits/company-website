package com.yangdoujiao.website.planningagent.evidence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

class EvidencePolicyTest {
    private static final Instant NOW = Instant.parse("2026-10-15T00:00:00Z");
    private final EvidencePolicy policy = new EvidencePolicy();

    @Test
    void reviewedOfficialEvidenceIsUsable() {
        assertThat(policy.assess(valid(), NOW, "2027-02")).isEqualTo(EvidenceState.VERIFIED);
    }

    @ParameterizedTest
    @MethodSource("unusableEvidence")
    void untrustedIncompleteOrStaleEvidenceRequiresReview(Evidence evidence) {
        assertThat(policy.assess(evidence, NOW, "2027-02")).isEqualTo(EvidenceState.REVIEW_REQUIRED);
    }

    static Stream<Evidence> unusableEvidence() {
        var e = valid();
        return Stream.of(
                null,
                copy("ai_generated", e.sourceUrl(), e.studentScope(), e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy("UNOFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy(null, e.sourceUrl(), e.studentScope(), e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", null, e.studentScope(), e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", "", e.studentScope(), e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", "http://example.edu", e.studentScope(), e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", "https:///admissions", e.studentScope(), e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", "https://bad host/admissions", e.studentScope(), e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", "https://user:pass@example.edu", e.studentScope(), e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), "OTHER", e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), null, e.intake(), NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), null, NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), " ", NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), "2027-09", NOW, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), null, null, "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW.plusNanos(1), null, "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW.minus(90, ChronoUnit.DAYS).minusNanos(1), null, "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW, NOW.minusNanos(1), "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW, NOW, "VERIFIED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW, null, "DRAFT", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW, null, "REVOKED", 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW, null, null, 3L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW, null, "VERIFIED", null, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW, null, "VERIFIED", 0L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW, null, "VERIFIED", -1L, false),
                copy("OFFICIAL", e.sourceUrl(), e.studentScope(), e.intake(), NOW, null, "VERIFIED", 3L, true));
    }

    @Test
    void ninetyDayBoundaryRemainsUsable() {
        assertThat(policy.assess(copy("OFFICIAL", valid().sourceUrl(), "CN_MAINLAND", "2027-02",
                NOW.minus(90, ChronoUnit.DAYS), NOW.plusNanos(1), "VERIFIED", 3L, false), NOW, "2027-02"))
                .isEqualTo(EvidenceState.VERIFIED);
    }

    @Test
    void missingAssessmentContextRequiresReview() {
        assertThat(policy.assess(valid(), null, "2027-02")).isEqualTo(EvidenceState.REVIEW_REQUIRED);
        assertThat(policy.assess(valid(), NOW, null)).isEqualTo(EvidenceState.REVIEW_REQUIRED);
        assertThat(policy.assess(valid(), NOW, " ")).isEqualTo(EvidenceState.REVIEW_REQUIRED);
    }

    private static Evidence valid() {
        return copy("OFFICIAL", "https://example.edu/admissions", "CN_MAINLAND", "2027-02", NOW,
                null, "VERIFIED", 3L, false);
    }

    private static Evidence copy(String sourceType, String url, String scope, String intake,
            Instant checked, Instant expires, String review, Long reviewer, boolean conflict) {
        return new Evidence(1, 2, "ADMISSIONS", url, sourceType, scope, intake, checked, expires,
                review, reviewer, "Official admissions requirements", conflict);
    }
}
