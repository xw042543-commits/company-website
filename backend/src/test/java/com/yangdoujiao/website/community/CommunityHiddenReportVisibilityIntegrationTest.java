package com.yangdoujiao.website.community;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import com.yangdoujiao.website.auth.account.UserAccount;
import com.yangdoujiao.website.auth.session.UserPrincipal;

class CommunityHiddenReportVisibilityIntegrationTest extends CommunityModerationIntegrationFixture {
    org.springframework.test.web.servlet.ResultActions commentReport(long target,UserAccount reporter,String key) throws Exception {
        return mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/community/reports")
                .with(user(UserPrincipal.from(reporter))).with(csrf()).header("Idempotency-Key",key).contentType("application/json")
                .content("{\"targetType\":\"COMMENT\",\"targetId\":\""+target+"\",\"reasonCode\":\"SPAM\"}"));
    }
    @ParameterizedTest @EnumSource(CommunityContentStatus.class)
    void hiddenRootAndReplyReportsRequirePublishedOwningPost(CommunityContentStatus postStatus) throws Exception {
        long id=post(postStatus),hiddenRoot=comment(id,null,CommunityContentStatus.HIDDEN);
        long visibleRoot=comment(id,null,CommunityContentStatus.PUBLISHED),hiddenReply=comment(id,visibleRoot,CommunityContentStatus.HIDDEN);
        int expected=postStatus==CommunityContentStatus.PUBLISHED?201:409;
        commentReport(hiddenRoot,actor,"hidden-root").andExpect(status().is(expected));
        commentReport(hiddenReply,actor,"hidden-reply").andExpect(status().is(expected));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reports WHERE reporter_account_id=?",Long.class,actor.getId()))
                .isEqualTo(expected==201?2:0);
    }
    @ParameterizedTest @EnumSource(CommunityContentStatus.class)
    void hiddenReplyReportsRequirePublishedTopLevelRoot(CommunityContentStatus rootStatus) throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED),root=comment(id,null,rootStatus),reply=comment(id,root,CommunityContentStatus.HIDDEN);
        int expected=rootStatus==CommunityContentStatus.PUBLISHED?201:409;
        commentReport(reply,actor,"hidden-reply-root-status").andExpect(status().is(expected));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reports WHERE reporter_account_id=?",Long.class,actor.getId()))
                .isEqualTo(expected==201?1:0);
    }
    @Test void originalReceiptAndOpenDuplicateSurviveAncestorHideWhileFreshReporterIsRejected() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED),root=comment(id,null,CommunityContentStatus.HIDDEN);
        String original=commentReport(root,actor,"original-hidden").andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        action("POST",id,"HIDE","SPAM",0,null).andExpect(status().isOk());
        assertThat(commentReport(root,actor,"original-hidden").andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).isEqualTo(original);
        commentReport(root,actor,"duplicate-hidden").andExpect(status().isOk());
        commentReport(root,account(),"fresh-hidden").andExpect(status().isConflict());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reports WHERE target_type='COMMENT' AND target_id=?",Long.class,root)).isEqualTo(1);
    }
    @Test void hiddenPostHasNoAncestorAndRemainsReportable() throws Exception {
        report(post(CommunityContentStatus.HIDDEN),actor,"hidden-post","SPAM","").andExpect(status().isCreated());
    }
    @Test void hiddenReplyCannotTreatAPublishedReplyAsATopLevelRoot() throws Exception {
        long id=post(CommunityContentStatus.PUBLISHED),root=comment(id,null,CommunityContentStatus.PUBLISHED);
        long invalidRoot=comment(id,root,CommunityContentStatus.PUBLISHED),target=comment(id,invalidRoot,CommunityContentStatus.HIDDEN);
        commentReport(target,actor,"nested-hidden").andExpect(status().isConflict());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM community_reports WHERE reporter_account_id=?",Long.class,actor.getId())).isZero();
    }
}
