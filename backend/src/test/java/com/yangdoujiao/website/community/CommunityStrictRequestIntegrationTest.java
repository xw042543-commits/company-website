package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;
import com.yangdoujiao.website.auth.session.UserPrincipal;

class CommunityStrictRequestIntegrationTest extends CommunityModerationIntegrationFixture {
    static Stream<Arguments> enumForms() {
        var scalars=Stream.of("0","1","\"0\"","\"1\"","0.0","0e0","true","null","{}","[]")
                .flatMap(form->Stream.of(Arguments.of("targetType",form),Arguments.of("reasonCode",form)));
        return Stream.concat(scalars,Stream.of(Arguments.of("targetType","\"post\""),Arguments.of("targetType","\" POST\""),
                Arguments.of("reasonCode","\"spam\""),Arguments.of("reasonCode","\" SPAM\"")));
    }
    @ParameterizedTest @MethodSource("enumForms")
    void reportEnumsRequireExactStringTokensAndMalformedRequestsPersistNothing(String field,String raw) throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        String body="{\"targetType\":"+(field.equals("targetType")?raw:"\"POST\"")+",\"targetId\":\""+id+
                "\",\"reasonCode\":"+(field.equals("reasonCode")?raw:"\"SPAM\"")+"}";
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/reports")
                .with(user(UserPrincipal.from(actor))).with(csrf()).header("Idempotency-Key","strict-report")
                .contentType("application/json").content(body)).andExpect(status().isBadRequest());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reports WHERE reporter_account_id=?",Long.class,actor.getId())).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_idempotency_records WHERE account_id=?",Long.class,actor.getId())).isZero();
    }
    static Stream<Arguments> actionEnumForms() {
        var scalars=Stream.of("0","1","\"0\"","\"1\"","0.0","0e0","true","null","{}","[]")
                .flatMap(form->Stream.of(Arguments.of("command",form),Arguments.of("reasonCode",form)));
        return Stream.concat(scalars,Stream.of(Arguments.of("command","\"hide\""),Arguments.of("command","\" HIDE\""),
                Arguments.of("reasonCode","\"spam\""),Arguments.of("reasonCode","\" SPAM\"")));
    }
    @ParameterizedTest @MethodSource("actionEnumForms")
    void moderationEnumsRequireExactStringTokensAndNeverCreateActions(String field,String raw) throws Exception {
        // Ordinal 1 used to mean RESTORE; give it an otherwise valid restore request so semantic validation cannot mask coercion.
        boolean restore=field.equals("command")&&(raw.equals("1")||raw.equals("\"1\""));
        var initial=restore?CommunityContentStatus.HIDDEN:CommunityContentStatus.PUBLISHED;
        long id=post(initial);
        String body="{\"command\":"+(field.equals("command")?raw:"\"HIDE\"")+",\"reasonCode\":"+
                (field.equals("reasonCode")?raw:restore?"\"APPEAL_ACCEPTED\"":"\"SPAM\"")+",\"version\":0}";
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(path("POST",id)+"/actions")
                .with(user(UserPrincipal.from(adviser))).with(csrf()).contentType("application/json").content(body))
                .andExpect(status().isBadRequest());
        assertNoDecision(id,initial);
    }
    @ParameterizedTest @ValueSource(strings={"0.0","0e0","0E+0","0.5","-0.5","\"0\"","\"0.0\"","\"0e0\"","true","false","null","{}","[]","-1","9223372036854775808"})
    void moderationVersionRequiresNonnegativeIntegralJsonInteger(String raw) throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(path("POST",id)+"/actions")
                .with(user(UserPrincipal.from(adviser))).with(csrf()).contentType("application/json")
                .content("{\"command\":\"HIDE\",\"reasonCode\":\"SPAM\",\"version\":"+raw+"}"))
                .andExpect(status().isBadRequest());
        assertNoDecision(id,CommunityContentStatus.PUBLISHED);
    }
    private void assertNoDecision(long id,CommunityContentStatus initial) {
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_moderation_actions WHERE target_id=?",Long.class,id)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_user_restrictions WHERE account_id=?",Long.class,actor.getId())).isZero();
        assertThat(jdbc.queryForObject("SELECT status FROM community_posts WHERE id=?",String.class,id)).isEqualTo(initial.name());
        assertThat(version("POST",id)).isZero();
    }
}
