package com.yangdoujiao.website.planningagent.security;

import static org.assertj.core.api.Assertions.*;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import com.yangdoujiao.website.planningagent.session.PlanningDtos.*;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.Profile;

class PlanningPrivacyFilterTest {
    @Test void canonicalizesOnlyAcademicScaleAliasesAndPreservesScoresExactly() {
        var aliases = new tools.jackson.databind.ObjectMapper().readTree(
                getClass().getResourceAsStream("/planning-score-contract.json")).get("aliases");
        for (String field : List.of("grade", "math", "science")) for (var alias : aliases.properties()) {
            var facts = new PlanningPrivacyFilter().sanitize(input("plan",Map.of(field,"3.00",field+".scale",alias.getKey(),
                    "languageTotal","7.0","languageTotal.scale","IELTS")),List.of()).confirmedProfile().facts();
            assertThat(facts).containsEntry(field,"3.00").containsEntry(field+".scale",alias.getValue().asText())
                    .containsEntry("languageTotal","7.0").containsEntry("languageTotal.scale","IELTS");
        }
    }
    private RunInput input(String text, Map<String,String> facts) {
        return new RunInput(UUID.randomUUID(),UUID.randomUUID(),999,Intent.CHAT,text,
                new Profile(1,facts),List.of(new Message(1,"USER",text,Instant.now())),Instant.now().plusSeconds(60));
    }
    @Test void allowsUsefulStructuredFactsWithoutIdentityOrUnboundedFields() {
        var context=new PlanningPrivacyFilter().sanitize(input("plan",Map.of("targetLevel","MASTER","budget","50000",
                "institution","Alice School","major","my name is Alice","languageTest","IELTS")),List.of());
        assertThat(context.confirmedProfile().facts()).containsExactlyInAnyOrderEntriesOf(
                Map.of("targetLevel","MASTER","budget","50000","languageTest","IELTS"));
        assertThat(context.redactedMessages()).containsExactly("plan");
    }
    @Test void stripsContactsButRejectsUnrecognizedPersonalNarrative() {
        assertThat(new PlanningPrivacyFilter().sanitize(input("plan alice@example.com 13800138000",Map.of()),List.of())
                .redactedMessages()).containsExactly("plan");
        for(String text:List.of("my name is Alice","passport A12345678","微信 abc123","I have a rare medical condition")) {
            assertThatThrownBy(()->new PlanningPrivacyFilter().sanitize(input(text,Map.of()),List.of()))
                    .isInstanceOfSatisfying(com.yangdoujiao.website.common.exception.ApiException.class,
                            e->assertThat(e.getCode()).isEqualTo("STRUCTURED_INPUT_REQUIRED"));
        }
    }
    @Test void structuredFieldCannotSmuggleSensitiveText() {
        assertThatThrownBy(()->new PlanningPrivacyFilter().sanitize(input("plan",Map.of("budget","passport A12345678")),List.of()))
                .isInstanceOfSatisfying(com.yangdoujiao.website.common.exception.ApiException.class,
                        e->assertThat(e.getCode()).isEqualTo("STRUCTURED_INPUT_REQUIRED"));
    }
    @Test void unsupportedAcademicScaleNeverBecomesAnAcceptedModelFact() {
        for (String scale : List.of("UNKNOWN","IELTS","120")) assertThatThrownBy(() -> new PlanningPrivacyFilter().sanitize(
                input("plan",Map.of("grade","80","grade.scale",scale)),List.of()))
                .isInstanceOfSatisfying(com.yangdoujiao.website.common.exception.ApiException.class,
                        e -> assertThat(e.getCode()).isEqualTo("STRUCTURED_INPUT_REQUIRED"));
    }
}
