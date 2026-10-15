package com.yangdoujiao.website.planningagent.security;

import static org.assertj.core.api.Assertions.*;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import com.yangdoujiao.website.planningagent.session.PlanningDtos.*;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.Profile;

class PlanningPrivacyFilterTest {
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
}
