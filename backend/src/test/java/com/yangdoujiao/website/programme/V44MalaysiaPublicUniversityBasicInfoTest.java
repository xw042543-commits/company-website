package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;

class V44MalaysiaPublicUniversityBasicInfoTest {

    private static final Pattern OFFICIAL_ROW = Pattern.compile("(?m)^    \\('(UM_[A-Z]+_\\d+)',");

    @Test
    void limitsVerifiedBasicInformationRepairToSeventyTwoPublishedUmProgrammes() throws IOException {
        String migration = migration();
        var matcher = OFFICIAL_ROW.matcher(migration.substring(0, migration.indexOf("DO $$ BEGIN")));
        Set<String> programmeCodes = new HashSet<>();
        while (matcher.find()) programmeCodes.add(matcher.group(1));

        assertThat(programmeCodes).hasSize(72);
        assertThat(programmeCodes).allMatch(code -> code.startsWith("UM_BACHELOR_"));
        assertThat(migration).contains("u.slug = 'um'", "p.status = 'PUBLISHED'");
        assertThat(migration).doesNotContain("u.slug = 'ukm'", "u.slug = 'utm'", "u.slug = 'upm'", "u.slug = 'usm'");
    }

    @Test
    void doesNotUpdateContentOrProgrammeNames() throws IOException {
        String migration = migration();
        String updateBlock = migration.substring(migration.indexOf("UPDATE programmes p SET"),
                migration.indexOf("-- Replace only the known legacy month-only labels"));

        assertThat(updateBlock).contains("duration_months", "study_pace_display", "tuition_currency", "official_url", "source_checked_at");
        assertThat(updateBlock).doesNotContain("name_zh =", "name_en =", "description_zh =", "description_en =");
        assertThat(migration).doesNotContain("section_type = 'CURRICULUM'", "section_type = 'CAREER_OPPORTUNITIES'", "DELETE FROM");
    }

    private static String migration() throws IOException {
        try (var stream = V44MalaysiaPublicUniversityBasicInfoTest.class.getResourceAsStream(
                "/db/migration/V44__repair_my_public_university_basic_information.sql")) {
            if (stream == null) throw new IOException("V44 migration resource is missing");
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
