package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import com.yangdoujiao.website.common.exception.ApiException;
import tools.jackson.databind.ObjectMapper;

class CommunityPostMetadataTest {
    private final ObjectMapper json = new ObjectMapper();

    @Test void omittedAndNullableFieldsNormalizeToLegacyDefaults() {
        assertThat(metadata("{\"body\":\"body\"}"))
                .isEqualTo(new CommunityPostMetadata(null, CommunityCategory.GENERAL, null));
        assertThat(metadata("{\"body\":\"body\",\"title\":null,\"category\":\"GENERAL\",\"universityId\":null}"))
                .isEqualTo(new CommunityPostMetadata(null, CommunityCategory.GENERAL, null));
        assertThat(CommunityPostMetadata.from(new CommunityPostRequest(json.readTree("\"body\""))))
                .isEqualTo(new CommunityPostMetadata(null, CommunityCategory.GENERAL, null));
    }

    @Test void normalizesTitleLineEndingsWithoutTrimmingAndCountsUnicodeCodePoints() {
        assertThat(metadata(json.writeValueAsString(java.util.Map.of("body", "body", "title", "😀".repeat(60)))).title())
                .isEqualTo("😀".repeat(60));
        assertThat(metadata("{\"body\":\"body\",\"title\":\"  line\\r\\nnext\\r  \"}").title())
                .isEqualTo("  line\nnext\n  ");
        assertThatThrownBy(() -> metadata(json.writeValueAsString(java.util.Map.of("body", "body", "title", "😀".repeat(61)))))
                .isInstanceOf(ApiException.class);
        for (String title : java.util.List.of("", " \u00a0", "\ufeff", "\t\n\ufeff\u2007\u202f\u3000", "\u0000", "\ud800")) {
            assertThatThrownBy(() -> metadata(json.writeValueAsString(java.util.Map.of("body", "body", "title", title))))
                    .isInstanceOf(ApiException.class);
        }
    }

    @Test void acceptsOnlyExactCategoriesAndDecimalStringUniversityIds() {
        for (String category : java.util.List.of("GENERAL", "NEWCOMER", "HOUSING", "MARKETPLACE", "STUDY", "MEETUP")) {
            assertThat(metadata("{\"category\":\"" + category + "\",\"universityId\":\"9007199254740993\"}").category().name())
                    .isEqualTo(category);
        }
        assertThat(metadata("{\"universityId\":\"9007199254740993\"}").universityId()).isEqualTo(9007199254740993L);
        for (String payload : java.util.List.of("{\"category\":null}", "{\"category\":\"general\"}", "{\"category\":1}",
                "{\"universityId\":1}", "{\"universityId\":\"01\"}", "{\"universityId\":\"9223372036854775808\"}")) {
            assertThatThrownBy(() -> metadata(payload)).isInstanceOf(ApiException.class);
        }
    }

    private CommunityPostMetadata metadata(String payload) {
        return CommunityPostMetadata.from(json.readValue(payload, CommunityPostRequest.class));
    }
}
