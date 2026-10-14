package com.yangdoujiao.website.programme;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

class V41ProgrammeContentShardOneTest {

    @Test
    void migrationIsPartitionedAndOnlyGeneratedRowsCanBeRewritten() throws IOException {
        String migration = resource("/db/migration/V41__audit_programme_career_curriculum_shard_1.sql");

        assertThat(migration).contains("MOD(p.id, 4) = 1");
        assertThat(migration).contains("programme_detail_sections.source_type = 'ai_generated'");
        assertThat(migration).contains("source_type IN ('official', 'third_party')");
        assertThat(migration).contains("参考学习领域，非官方课程表");
        assertThat(migration).contains("不是院校官方课程名称、课程代码、学分、必修或选修安排");
        assertThat(migration).doesNotContain("DELETE FROM programme_detail_sections");
        assertThat(migration).doesNotContain("UPDATE programmes ");
    }

    private static String resource(String path) throws IOException {
        try (var stream = V41ProgrammeContentShardOneTest.class.getResourceAsStream(path)) {
            if (stream == null) throw new IOException("Missing resource " + path);
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
