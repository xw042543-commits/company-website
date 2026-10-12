package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

class CommunityRestrictionHttpIntegrationTest extends CommunityReactionIntegrationFixture {
    @Autowired tools.jackson.databind.ObjectMapper json;
    @Autowired CommunityUserRestrictionRepository restrictions;
    @org.junit.jupiter.api.BeforeEach void resetRateBudgets() {
        // MockMvc requests share a client address across test classes. A fresh account
        // does not isolate its address budget from earlier write/limiter tests.
        var keys = redis.keys("community:limit:v1:*");
        if (!keys.isEmpty()) redis.delete(keys);
    }
    @org.junit.jupiter.api.AfterEach void cleanupReceipts() {
        for(long id:accountIds)jdbc.update("DELETE FROM community_idempotency_records WHERE account_id=?",id);
    }
    @Test void timedMuteAndPermanentBanExposeOnlySafeDetailsAcrossEveryNewWrite() throws Exception {
        long postId=post(CommunityContentStatus.PUBLISHED);
        long commentId=comment(postId,null,CommunityContentStatus.PUBLISHED);
        var now=OffsetDateTime.now().withNano(0);
        for (var type : CommunityRestrictionType.values()) {
            var endsAt=type==CommunityRestrictionType.MUTED?now.plusHours(2):null;
            var restriction=restrictions.saveAndFlush(CommunityUserRestriction.create(actor.getId(),type,"INTERNAL_PRIVATE_REASON",now.minusMinutes(1),endsAt,actor.getId()));
            for (var request : writes(postId,commentId)) {
                String body=mvc.perform(request.with(user(com.yangdoujiao.website.auth.session.UserPrincipal.from(actor))).with(csrf()))
                        .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("COMMUNITY_USER_RESTRICTED"))
                        .andExpect(jsonPath("$.details.restrictionKind").value(type==CommunityRestrictionType.MUTED?"MUTE":"BAN"))
                        .andReturn().getResponse().getContentAsString();
                var details=json.readTree(body).path("details");
                assertThat(details.propertyNames()).containsExactlyInAnyOrderElementsOf(Set.of("restrictionKind","endsAt"));
                if(endsAt==null)assertThat(details.path("endsAt").isNull()).isTrue();
                else assertThat(OffsetDateTime.parse(details.path("endsAt").asString())).isEqualTo(endsAt);
                assertThat(body).doesNotContain("INTERNAL_PRIVATE_REASON","reasonCode","actorAccountId","createdBy","accountId");
            }
            // Cleanup writes remain possible while a community restriction is active.
            react(delete(postPath(postId)),actor).andExpect(status().isNoContent());
            restriction.release(actor.getId(),now);restrictions.saveAndFlush(restriction);
        }
    }
    @Test void expiredFutureAndReleasedRestrictionsDoNotDenyNewWrites() throws Exception {
        var now=OffsetDateTime.now().withNano(0);
        restrictions.saveAndFlush(CommunityUserRestriction.create(actor.getId(),CommunityRestrictionType.MUTED,"PRIVATE",now.minusHours(1),now.minusSeconds(1),actor.getId()));
        restrictions.saveAndFlush(CommunityUserRestriction.create(actor.getId(),CommunityRestrictionType.BANNED,"PRIVATE",now.plusHours(1),null,actor.getId()));
        var released=restrictions.saveAndFlush(CommunityUserRestriction.create(actor.getId(),CommunityRestrictionType.BANNED,"PRIVATE",now.minusHours(1),null,actor.getId()));
        released.release(actor.getId(),now);restrictions.saveAndFlush(released);
        long postId=post(CommunityContentStatus.PUBLISHED);
        react(put(postPath(postId)),actor).andExpect(status().isNoContent());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/posts")
                .with(user(com.yangdoujiao.website.auth.session.UserPrincipal.from(actor))).with(csrf()).header("Idempotency-Key","expired-safe")
                .contentType("application/json").content("{\"body\":\"new content\"}"))
                .andExpect(status().isCreated());
    }
    @Test void banTakesPrecedenceAndLatestMuteExpiryIsDeterministic() throws Exception {
        var now=OffsetDateTime.now().withNano(0);
        restrictions.saveAndFlush(CommunityUserRestriction.create(actor.getId(),CommunityRestrictionType.MUTED,"PRIVATE",now.minusHours(1),now.plusHours(1),actor.getId()));
        restrictions.saveAndFlush(CommunityUserRestriction.create(actor.getId(),CommunityRestrictionType.MUTED,"PRIVATE",now.minusHours(1),now.plusHours(3),actor.getId()));
        long postId=post(CommunityContentStatus.PUBLISHED);
        String body=react(put(postPath(postId)),actor).andExpect(status().isForbidden()).andExpect(jsonPath("$.details.endsAt").isString()).andReturn().getResponse().getContentAsString();
        assertThat(OffsetDateTime.parse(json.readTree(body).path("details").path("endsAt").asString())).isEqualTo(now.plusHours(3));
        restrictions.saveAndFlush(CommunityUserRestriction.create(actor.getId(),CommunityRestrictionType.BANNED,"PRIVATE",now.minusHours(1),null,actor.getId()));
        react(put(postPath(postId)),actor).andExpect(status().isForbidden()).andExpect(jsonPath("$.details.restrictionKind").value("BAN"))
                .andExpect(jsonPath("$.details.endsAt").isEmpty());
    }
    private List<MockHttpServletRequestBuilder> writes(long postId,long commentId) {
        return List.of(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/posts").header("Idempotency-Key","restricted-post").contentType("application/json").content("{\"body\":\"text\"}"),
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/posts/"+postId+"/comments").header("Idempotency-Key","restricted-comment").contentType("application/json").content("{\"body\":\"comment\"}"),
                put(postPath(postId)),put(commentPath(commentId)),
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/reports").header("Idempotency-Key","restricted-report").contentType("application/json")
                        .content("{\"targetType\":\"POST\",\"targetId\":\""+postId+"\",\"reasonCode\":\"SPAM\"}"));
    }
}
