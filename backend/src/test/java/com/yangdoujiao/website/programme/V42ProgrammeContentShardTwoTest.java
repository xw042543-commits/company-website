package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

class V42ProgrammeContentShardTwoTest {

    @Test
    void migrationIsPartitionedAndOnlyGeneratedRowsCanBeRewritten() throws IOException {
        String migration = resource("/db/migration/V42__audit_programme_career_curriculum_shard_2.sql");

        assertThat(migration).contains("MOD(p.id, 4) = 2");
        assertThat(migration).contains("programme_detail_sections.source_type = 'ai_generated'");
        assertThat(migration).contains("section.source_type IN ('official', 'third_party')");
        assertThat(migration).contains("参考学习领域，非官方课程表");
        assertThat(migration).contains("不是该院校已确认的课程名称、学分、必修或选修安排");
        assertThat(migration).doesNotContain("DELETE FROM programme_detail_sections");
        assertThat(migration).doesNotContain("UPDATE programmes ");
    }

    private static String resource(String path) throws IOException {
        try (var stream = V42ProgrammeContentShardTwoTest.class.getResourceAsStream(path)) {
            if (stream == null) throw new IOException("Missing resource " + path);
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
