package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

class V51ProgrammeLevelAlignmentTest {

    @Test
    void onlyAiGeneratedContentIsAlignedAndEveryResearchLevelIsExplicit() throws IOException {
        String migration = resource("/db/migration/V51__align_ai_programme_content_with_study_level.sql");

        assertThat(migration).contains("section.source_type = 'ai_generated'");
        assertThat(migration).contains("FOUNDATION|PRE_UNIVERSITY|CERT");
        assertThat(migration).contains("MASTER|POSTGRAD");
        assertThat(migration).contains("PHD|DOCTOR");
        assertThat(migration).contains("发展路径：该层次主要用于衔接本科或其他高等教育阶段");
        assertThat(migration).contains("专业高级理论|Advanced Theory in the Discipline");
        assertThat(migration).contains("博士研究与学位论文|Doctoral Research and Dissertation");
        assertThat(migration).contains("参考学习领域，非官方课程表");
        assertThat(migration).doesNotContain("DELETE FROM programme_detail_sections");
        assertThat(migration).doesNotContain("UPDATE programmes ");
        assertThat(migration).doesNotContain("source_type = 'official'");
        assertThat(migration).doesNotContain("source_type = 'third_party'");
    }

    private static String resource(String path) throws IOException {
        try (var stream = V51ProgrammeLevelAlignmentTest.class.getResourceAsStream(path)) {
            if (stream == null) throw new IOException("Missing resource " + path);
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
