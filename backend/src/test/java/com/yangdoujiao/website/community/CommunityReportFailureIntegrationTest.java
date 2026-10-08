package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

class CommunityReportFailureIntegrationTest extends CommunityModerationIntegrationFixture {
    @MockitoSpyBean StringRedisTemplate redisSpy;
    @MockitoSpyBean CommunityIdempotencyRecordRepository receipts;
    @Test void redisOutageFailsClosedForNewKeysWhileExactReplayNeedsNoNewBudget() throws Exception {
        long first=post(CommunityContentStatus.PUBLISHED),second=post(CommunityContentStatus.PUBLISHED);
        String original=report(first,actor,"before-outage","SPAM","").andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        doThrow(new org.springframework.data.redis.RedisConnectionFailureException("fixture Redis unavailable"))
                .when(redisSpy).execute(any(RedisScript.class),anyList(),any(Object[].class));
        assertThat(report(first,actor,"before-outage","SPAM","").andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).isEqualTo(original);
        report(first,actor,"existing-open","SPAM","").andExpect(status().isServiceUnavailable());
        report(second,actor,"outage","SPAM","").andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.code").value("COMMUNITY_WRITE_UNAVAILABLE"));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reports WHERE target_id=?",Long.class,second)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_idempotency_records WHERE account_id=? AND idempotency_key='outage'",Long.class,actor.getId())).isZero();
    }
    @Test void overBudgetReturns429AndReceiptFailureRollsBackAutomaticHideAndAction() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED);
        for(int i=0;i<30;i++)report(post(CommunityContentStatus.PUBLISHED),actor,"budget-"+i,"SPAM","").andExpect(status().isCreated());
        report(id,actor,"exceeded","SPAM","").andExpect(status().isTooManyRequests());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reports WHERE target_id=?",Long.class,id)).isZero();
        var keys=redis.keys("community:limit:*");if(!keys.isEmpty())redis.delete(keys);
        for(int i=0;i<4;i++)report(id,account(),"threshold","SPAM","").andExpect(status().isCreated());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/community/posts").param("sort","hot")).andExpect(status().isOk());
        String current=redis.opsForValue().get("community:hot:v1:current");
        doThrow(new org.springframework.dao.DataAccessResourceFailureException("fixture receipt unavailable")).when(receipts).saveAndFlush(any(CommunityIdempotencyRecord.class));
        report(id,account(),"rollback-hide","SPAM","").andExpect(status().isInternalServerError());
        assertThat(jdbc.queryForObject("SELECT status FROM community_posts WHERE id=?",String.class,id)).isEqualTo("PUBLISHED");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reports WHERE target_id=?",Long.class,id)).isEqualTo(4);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_moderation_actions WHERE target_id=?",Long.class,id)).isZero();
        assertThat(redis.opsForValue().get("community:hot:v1:current")).isEqualTo(current);
    }
}
