package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.auth.account.UserAccountRepository;
import com.yangdoujiao.website.common.exception.ApiException;

@Service
@Transactional
public class CommunityModerationService {
    private final CommunityModerationTargets targets;
    private final CommunityModerationQueryRepository query;
    private final CommunityReportRepository reports;
    private final CommunityModerationActionRepository actions;
    private final CommunityUserRestrictionRepository restrictions;
    private final UserAccountRepository accounts;
    private final CommunityCursorCodec cursors;
    private final CommunityAuditLogger audit;
    private final CommunityNotificationPublisher notifications;
    CommunityModerationService(CommunityModerationTargets targets,CommunityModerationQueryRepository query,CommunityReportRepository reports,
            CommunityModerationActionRepository actions,CommunityUserRestrictionRepository restrictions,UserAccountRepository accounts,
            CommunityCursorCodec cursors,CommunityAuditLogger audit,CommunityNotificationPublisher notifications) {
        this.targets=targets;this.query=query;this.reports=reports;this.actions=actions;this.restrictions=restrictions;
        this.accounts=accounts;this.cursors=cursors;this.audit=audit;
        this.notifications=notifications;
    }
    @Transactional(readOnly=true)
    public CommunityModerationPage queue(String status,CommunityTargetType type,String reason,OffsetDateTime from,OffsetDateTime to,String cursor,int size) {
        if(size<1||size>50||!List.of("PENDING","HIDDEN","PROCESSED").contains(status)||from!=null&&to!=null&&from.isAfter(to))throw invalid();
        if(reason!=null){try{CommunityReportReason.valueOf(reason);}catch(IllegalArgumentException e){throw invalid();}}
        String scope="moderation:"+status+":"+type+":"+reason+":"+from+":"+to;
        CommunityCursorCodec.Position after=null;String afterType=null;
        if(cursor!=null){try{after=cursors.decode(cursor,scope+":POST");afterType="POST";}catch(ApiException e){after=cursors.decode(cursor,scope+":COMMENT");afterType="COMMENT";}}
        var items=query.queue(status,type,reason,from,to,after,afterType,size+1);
        boolean more=items.size()>size;if(more)items=items.subList(0,size);
        var last=items.isEmpty()?null:items.getLast();
        String next=more?cursors.encode(last.createdAt(),Long.parseLong(last.targetId()),scope+":"+last.targetType()):null;
        return new CommunityModerationPage(List.copyOf(items),next);
    }
    @Transactional(readOnly=true)
    public CommunityModerationDetail detail(CommunityTargetType type,long id,String cursor) {
        String scope="moderation-actions:"+type+":"+id;
        var history=query.actions(type,id,cursor==null?null:cursors.decode(cursor,scope));
        boolean more=history.size()>20;if(more)history=history.subList(0,20);
        var last=history.isEmpty()?null:history.getLast();
        return query.detail(type,id,List.copyOf(history),more?cursors.encode(last.createdAt(),Long.parseLong(last.id()),scope):null);
    }
    public CommunityModerationDetail decide(long actor,CommunityTargetType type,long id,CommunityModerationRequest request) {
        validate(request);
        // Immutable scalar lookup only. Restriction transactions acquire the author account before any post/root/comment.
        long author=targets.author(type,id);
        accounts.findLockedById(author).orElseThrow(()->CommunityModerationTargets.missing(type));
        var target=targets.lock(type,id);
        var now=targets.now();
        // Row-lock waits may cross expiry or shift the maximum-duration boundary. Validate at the committed decision's start.
        if(request.command()==CommunityModerationCommand.MUTE)validateMuteWindow(request,now);
        if(target.version()!=request.version())throw new ApiException(HttpStatus.CONFLICT,"COMMUNITY_VERSION_CONFLICT","Content changed; refresh before deciding");
        CommunityContentStatus before=target.status(),next=before;
        switch(request.command()) {
            case HIDE -> {if(before!=CommunityContentStatus.PUBLISHED&&before!=CommunityContentStatus.PENDING_REVIEW)throw transition();next=CommunityContentStatus.HIDDEN;}
            case RESTORE -> {
                if(before!=CommunityContentStatus.HIDDEN&&before!=CommunityContentStatus.PENDING_REVIEW)throw transition();
                if(target.comment()!=null&&(target.post().getStatus()!=CommunityContentStatus.PUBLISHED||target.root()!=null&&target.root().getStatus()!=CommunityContentStatus.PUBLISHED))throw transition();
                next=CommunityContentStatus.PUBLISHED;
            }
            case REJECT_REPORT -> {if(reports.countByTargetTypeAndTargetIdAndStatus(type,id,CommunityReportStatus.OPEN)==0)throw transition();}
            case MUTE, BAN -> {
                if(before==CommunityContentStatus.DELETED||before==CommunityContentStatus.REJECTED)throw transition();
                restrictions.saveAndFlush(CommunityUserRestriction.create(author,request.command()==CommunityModerationCommand.MUTE?CommunityRestrictionType.MUTED:CommunityRestrictionType.BANNED,
                        request.reasonCode().name(),now,request.restrictionEndsAt(),actor));
            }
        }
        target.decide(next,now);
        if(next==CommunityContentStatus.PUBLISHED&&before!=CommunityContentStatus.PUBLISHED&&target.comment()!=null) {
            notifications.comment(target.post(),target.comment());
        }
        reports.resolveOpen(type,id,request.command()==CommunityModerationCommand.REJECT_REPORT?CommunityReportStatus.RESOLVED_REJECTED:CommunityReportStatus.RESOLVED_ACTIONED,
                actor,request.reasonCode().name(),now);
        if(next!=before){targets.reconcile(target);targets.invalidateAfterCommit();}
        actions.saveAndFlush(CommunityModerationAction.create(actor,type.name(),id,request.command().name(),request.reasonCode().name(),before,next,now));
        audit.recordAfterCommit(actor,type,id,request.command(),request.reasonCode());
        return detail(type,id,null);
    }
    private void validate(CommunityModerationRequest r) {
        if (r == null || r.command() == null || r.reasonCode() == null || r.version() == null || r.version() < 0) {
            throw invalid();
        }
        boolean restoreReason = r.reasonCode() == CommunityModerationReason.APPEAL_ACCEPTED
                || r.reasonCode() == CommunityModerationReason.REVIEW_APPROVED;
        boolean rejectReason = r.reasonCode() == CommunityModerationReason.REPORT_UNFOUNDED;
        boolean allowedReason = switch (r.command()) {
            case RESTORE -> restoreReason;
            case REJECT_REPORT -> rejectReason;
            case HIDE, MUTE, BAN -> !restoreReason && !rejectReason;
        };
        if (!allowedReason) throw invalid();
        if (r.command() == CommunityModerationCommand.MUTE) {
            validateMuteWindow(r,targets.now());
        } else if (r.restrictionEndsAt() != null) {
            throw invalid();
        }
    }
    private void validateMuteWindow(CommunityModerationRequest request,OffsetDateTime now) {
        if(request.restrictionEndsAt()==null||!request.restrictionEndsAt().isAfter(now)
                ||request.restrictionEndsAt().isAfter(now.plusDays(30)))throw invalid();
    }
    private static ApiException invalid(){return new ApiException(HttpStatus.BAD_REQUEST,"INVALID_COMMUNITY_MODERATION","Invalid moderation decision or filter");}
    private static ApiException transition(){return new ApiException(HttpStatus.CONFLICT,"COMMUNITY_MODERATION_TRANSITION","Decision is not available for the current target state");}
}
