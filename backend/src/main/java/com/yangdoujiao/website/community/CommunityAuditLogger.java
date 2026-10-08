package com.yangdoujiao.website.community;

import org.slf4j.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.*;
import com.yangdoujiao.website.common.web.RequestTraceFilter;

/** Accepts only structured metadata; no content, notes, identities or caller-supplied free text. */
@Component
public class CommunityAuditLogger {
    private static final Logger log=LoggerFactory.getLogger(CommunityAuditLogger.class);
    public void recordAfterCommit(long actor,CommunityTargetType type,long target,
            CommunityModerationCommand command,CommunityModerationReason reason) {
        register(actor,type,target,command.name(),reason.name());
    }
    public void recordAutomaticHideAfterCommit(long actor,CommunityTargetType type,long target) {
        register(actor,type,target,"AUTO_HIDE","REPORT_THRESHOLD");
    }
    private void register(long actor,CommunityTargetType type,long target,String command,String reason) {
        String candidate=MDC.get(RequestTraceFilter.TRACE_ID_MDC_KEY);
        String trace=candidate!=null&&candidate.matches("[A-Za-z0-9._-]{1,64}")?candidate:"unavailable";
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization(){
            @Override public void afterCommit(){log.info("community_decision trace={} actor={} type={} target={} command={} reason={} outcome=COMMITTED",
                    trace,actor,type,target,command,reason);}
        });
    }
}
