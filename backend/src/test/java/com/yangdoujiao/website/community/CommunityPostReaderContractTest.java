package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

/** Emits real server JSON for the explicit miniapp/frontend cross-language contract runner. */
class CommunityPostReaderContractTest {
    private final ObjectMapper json = tools.jackson.databind.json.JsonMapper.builder()
            .enable(tools.jackson.core.json.JsonWriteFeature.ESCAPE_NON_ASCII).build();
    private static final OffsetDateTime TIME = OffsetDateTime.parse("2026-10-08T00:00:00Z");

    @Test void ingressAndHistoricalTitlesSerializeForEveryReader() throws Exception {
        var cases = new ArrayList<Map<String, Object>>();
        for (String title : List.of("😀".repeat(60), "\ufeff\u00a0问题\u2007\u202f\u3000", "问题\r\n补充")) {
            var accepted = CommunityPostMetadata.from(json.readValue(json.writeValueAsString(
                    Map.of("body", "body", "title", title)), CommunityPostRequest.class));
            cases.add(representations(accepted.title(), accepted.title()));
        }
        cases.add(representations(null, null));
        for (String title : List.of("\ufeff", " \u00a0", "\u2007\u202f\u3000", "", "😀".repeat(61), "bad\0title", "\ud800")) {
            cases.add(representations(title, null));
        }
        Path output = Path.of("target/community-reader-contract.json");
        Files.createDirectories(output.getParent());
        Files.writeString(output, json.writeValueAsString(cases));
        for (var item : cases) {
            for (String key : List.of("campusDetail", "adviserDetail")) {
                var serialized = json.readTree(json.writeValueAsString(item.get(key)));
                assertThat(serialized.get("title").isNull() ? null : serialized.get("title").asString())
                        .as(key + " must preserve valid titles and replace invalid historical titles with null")
                        .isEqualTo(item.get("expectedTitle"));
            }
            for (String key : List.of("campusFeed", "campusPersonal", "adviserQueue")) {
                var serialized = json.readTree(json.writeValueAsString(item.get(key))).get("items").get(0);
                assertThat(serialized.get("title").isNull() ? null : serialized.get("title").asString())
                        .as(key + " must not let one historical title poison a page").isEqualTo(item.get("expectedTitle"));
            }
        }
    }

    private Map<String, Object> representations(String title, String expectedTitle) {
        var summary = new CommunityPostSummary("42", "微信用户", null, "body", 0, 0, TIME, false,
                title, CommunityCategory.STUDY, "1", "Campus");
        var detail = new CommunityPostDetail("42", "微信用户", null, "body", 0, 0, TIME, false, true,
                title, CommunityCategory.STUDY, "1", "Campus");
        var personal = new CommunityMyPost("42", "body", CommunityContentStatus.PUBLISHED, "已发布", TIME, TIME, 0, 0,
                title, CommunityCategory.STUDY, "1", "Campus");
        var queue = new CommunityModerationPage(List.of(new CommunityModerationPage.Item(CommunityTargetType.POST,
                "42", CommunityContentStatus.PUBLISHED, "body", 0, 0, TIME, CommunityModerationPage.SlaState.ON_TIME,
                title, CommunityCategory.STUDY, "1", "Campus")), null);
        var adviser = new CommunityModerationDetail(CommunityTargetType.POST, "42", CommunityContentStatus.PUBLISHED,
                "body", null, null, 0, 0, List.of(), List.of(), null, title, CommunityCategory.STUDY, "1", "Campus");
        var result = new LinkedHashMap<String, Object>();
        result.put("expectedTitle", expectedTitle);
        result.put("legacyFeed", CommunityPostRepresentation.feed(new CommunityCursorPage<>(List.of(summary), null), false).getBody());
        result.put("legacyDetail", CommunityPostRepresentation.detail(detail, false).getBody());
        result.put("legacyPersonal", CommunityPostRepresentation.personal(new CommunityCursorPage<>(List.of(personal), null), false).getBody());
        result.put("campusFeed", CommunityPostRepresentation.feed(new CommunityCursorPage<>(List.of(summary), null), true).getBody());
        result.put("campusDetail", CommunityPostRepresentation.detail(detail, true).getBody());
        result.put("campusPersonal", CommunityPostRepresentation.personal(new CommunityCursorPage<>(List.of(personal), null), true).getBody());
        result.put("adviserQueue", queue);
        result.put("adviserDetail", adviser);
        return result;
    }
}
