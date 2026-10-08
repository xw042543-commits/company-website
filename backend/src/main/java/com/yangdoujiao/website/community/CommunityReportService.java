package com.yangdoujiao.website.community;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.auth.AuthHash;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.common.exception.ApiException;
import tools.jackson.databind.*;

@Service
@Transactional
public class CommunityReportService {
    private final CommunityProperties properties;
    private final CommunityReportRepository reports;
    private final CommunityIdempotencyRecordRepository receipts;
    private final CommunityUserRestrictionRepository restrictions;
    private final UserAccountRepository accounts;
    private final CommunityModerationTargets targets;
    private final CommunityRateLimiter limiter;
    private final ObjectMapper json;
    private final int threshold;
    private final CommunityModerationActionRepository actions;
    private final CommunityAuditLogger audit;
    CommunityReportService(CommunityProperties properties,CommunityReportRepository reports,
            CommunityIdempotencyRecordRepository receipts,CommunityUserRestrictionRepository restrictions,
            UserAccountRepository accounts,CommunityModerationTargets targets,CommunityRateLimiter limiter,ObjectMapper json,
            CommunityModerationActionRepository actions,CommunityAuditLogger audit) {
        this.properties=properties;this.reports=reports;this.receipts=receipts;this.restrictions=restrictions;this.accounts=accounts;
        this.targets=targets;this.limiter=limiter;this.json=json;this.threshold=properties.autoHideReportThreshold();this.actions=actions;this.audit=audit;
    }
    public Result submit(long actor,String address,String key,CommunityReportRequest request) {
        if (request == null || request.targetType() == null || request.reasonCode() == null
                || request.targetId() == null || !request.targetId().isString()) throw invalid();
        long id=CommunityWriteService.decimalId(request.targetId().asString());
        String note=note(request.note());
        if (key == null || !key.matches("[A-Za-z0-9._:-]{1,64}")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_IDEMPOTENCY_KEY", "A valid Idempotency-Key is required");
        }
        if (!properties.enabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "COMMUNITY_DISABLED", "Community writes are disabled");
        }
        var account=accounts.findLockedById(actor).orElseThrow(()->new ApiException(HttpStatus.UNAUTHORIZED,"AUTHENTICATION_REQUIRED","Authentication is required"));
        if(account.getStatus()!=UserAccountStatus.ACTIVE)throw restricted();
        String hash=AuthHash.sha256(json.writeValueAsString(List.of(request.targetType(),Long.toString(id),request.reasonCode(),note)));
        var stored=receipts.findByAccountIdAndOperationTypeAndIdempotencyKey(actor,"CREATE_REPORT",key);
        if(stored.isPresent()) {
            var receipt = stored.get();
            if (!receipt.getRequestHash().equals(hash)) {
                throw new ApiException(HttpStatus.CONFLICT, "IDEMPOTENCY_CONFLICT", "Idempotency key was used for a different request");
            }
            if(receipt.getResultResponse()==null)throw CommunityRateLimiter.unavailable();
            return new Result(json.readValue(receipt.getResultResponse(),CommunityReportResponse.class),true);
        }
        if(restrictions.existsActive(actor,targets.now()))throw restricted();
        var target=targets.lock(request.targetType(),id);
        var duplicate=reports.findByReporterAccountIdAndTargetTypeAndTargetIdAndStatus(actor,request.targetType(),id,CommunityReportStatus.OPEN);
        boolean existing=duplicate.isPresent();
        // A fresh key persists a receipt even for an existing OPEN report, so it must consume the protected budget.
        limiter.checkReport(actor,address);
        CommunityReport report;
        if(existing) report=duplicate.get();
        else {
            // Hidden content may still collect reports during the automatic threshold race; terminal evidence may not.
            if(target.status()!=CommunityContentStatus.HIDDEN&&!target.publicTarget())throw new ApiException(HttpStatus.CONFLICT,"COMMUNITY_TARGET_UNAVAILABLE","Community target is not reportable");
            report=reports.saveAndFlush(CommunityReport.create(actor,request.targetType(),id,request.reasonCode().name(),note,targets.now()));
            if(target.publicTarget()&&reports.countByTargetTypeAndTargetIdAndStatus(request.targetType(),id,CommunityReportStatus.OPEN)>=threshold) {
                target.decide(CommunityContentStatus.HIDDEN,targets.now());targets.reconcile(target);
                actions.saveAndFlush(CommunityModerationAction.create(actor,request.targetType().name(),id,"AUTO_HIDE","REPORT_THRESHOLD",
                        CommunityContentStatus.PUBLISHED,CommunityContentStatus.HIDDEN,targets.now()));
                targets.invalidateAfterCommit();audit.recordAutomaticHideAfterCommit(actor,request.targetType(),id);
            }
        }
        var response=new CommunityReportResponse(report.getId().toString(),report.getTargetType(),report.getTargetId().toString(),report.getStatus(),report.getCreatedAt());
        receipts.saveAndFlush(CommunityIdempotencyRecord.create(actor,"CREATE_REPORT",key,hash,report.getId(),json.writeValueAsString(response),targets.now()));
        return new Result(response,existing);
    }
    private static String note(JsonNode node) {
        if(node==null||node.isNull())return "";
        if(!node.isString())throw invalid();
        String note=node.asString().replace("\r\n","\n").replace('\r','\n');
        if(note.codePointCount(0,note.length())>500||note.codePoints().anyMatch(p->p>=0xD800&&p<=0xDFFF||p==0))throw invalid();
        return note;
    }
    private static ApiException invalid(){return new ApiException(HttpStatus.BAD_REQUEST,"INVALID_COMMUNITY_REPORT","Invalid community report");}
    private static ApiException restricted(){return new ApiException(HttpStatus.FORBIDDEN,"COMMUNITY_USER_RESTRICTED","Community account is restricted");}
    public record Result(CommunityReportResponse response,boolean replay) {}
}
