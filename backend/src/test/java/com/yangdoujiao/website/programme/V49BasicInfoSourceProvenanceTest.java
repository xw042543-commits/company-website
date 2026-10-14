package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

class V49BasicInfoSourceProvenanceTest {

    @Test
    void recordsTheThreeAllowedSourceTypesAndAuditsOnlyPublishedMalaysiaProgrammes() throws IOException {
        String migration = migration();

        assertThat(migration)
                .contains("'official', 'third_party', 'ai_generated'")
                .contains("c.code = 'MY'")
                .contains("u.status = 'PUBLISHED'")
                .contains("p.status = 'PUBLISHED'")
                .contains("s.section_type = 'ADMISSIONS'");
    }

    @Test
    void doesNotRewriteNamesDescriptionsCareerOrCurriculum() throws IOException {
        String migration = migration();

        assertThat(migration)
                .doesNotContain("name_zh =", "name_en =", "description_zh =", "description_en =")
                .doesNotContain("section_type = 'CAREER_OPPORTUNITIES'", "section_type = 'CURRICULUM'")
                .doesNotContain("DELETE FROM", "TRUNCATE");
    }

    private static String migration() throws IOException {
        try (var stream = V49BasicInfoSourceProvenanceTest.class.getResourceAsStream(
                "/db/migration/V49__add_basic_info_source_provenance.sql")) {
            if (stream == null) {
                throw new IOException("V49 migration resource is missing");
            }
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}

