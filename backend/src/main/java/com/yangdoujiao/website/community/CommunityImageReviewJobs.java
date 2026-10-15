package com.yangdoujiao.website.community;

import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.beans.factory.annotation.Autowired;

/** Durable claims and callback inbox. No provider calls while database locks are held. */
@Repository
public class CommunityImageReviewJobs {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate tx;
    public record Claim(String imageId,long owner,String lease,int attempt,boolean directFallback) {}
    @Autowired public CommunityImageReviewJobs(JdbcTemplate jdbc,PlatformTransactionManager manager) {
        this(jdbc,new TransactionTemplate(manager));
    }
    CommunityImageReviewJobs(JdbcTemplate jdbc,TransactionTemplate tx){this.jdbc=jdbc;this.tx=tx;}
    public Optional<Claim> claim(Instant now) {
        return tx.execute(ignored->{
            lock();
            // A lost acknowledgement or a missing callback must eventually enter manual review.
            jdbc.update("""
                UPDATE community_images i SET status='REVIEW' FROM community_image_review_jobs j
                WHERE j.image_id=i.id AND i.status='PENDING' AND j.available_at<=?
                  AND (j.state='WAITING' OR (j.state IN ('LEASED','READY') AND j.attempts>=3))
                """,time(now));
            finishTerminal();
            var rows=jdbc.query("""
                SELECT j.image_id,i.owner_account_id,j.attempts,j.direct_fallback FROM community_image_review_jobs j
                JOIN community_images i ON i.id=j.image_id JOIN community_posts p ON p.id=i.post_id
                WHERE j.state IN ('READY','LEASED') AND j.attempts<3 AND j.available_at<=?
                  AND i.status='PENDING' AND p.status='PENDING_REVIEW' AND p.version=0
                ORDER BY j.available_at,j.image_id LIMIT 1
                """,(rs,n)->new Claim(rs.getString(1),rs.getLong(2),UUID.randomUUID().toString(),rs.getInt(3)+1,rs.getBoolean(4)),time(now));
            if(rows.isEmpty())return Optional.empty();
            Claim claim=rows.getFirst();
            jdbc.update("UPDATE community_image_review_jobs SET state='LEASED',lease_token=?,attempts=?,available_at=? WHERE image_id=?",
                claim.lease(),claim.attempt(),time(now.plusSeconds(120)),claim.imageId());
            return Optional.of(claim);
        });
    }
    public void acknowledge(Claim claim,String trace,Instant now) {
        validateTrace(trace);
        tx.executeWithoutResult(ignored->{
            lock();
            int changed=jdbc.update("UPDATE community_image_review_jobs SET state='WAITING',trace_id=?,available_at=? WHERE image_id=? AND state='LEASED' AND lease_token=?",
                trace,time(now.plusSeconds(35*60)),claim.imageId(),claim.lease());
            if(changed==1)apply(trace,now);
        });
    }
    public void failed(Claim claim,Instant now) {
        tx.executeWithoutResult(ignored->{
            lock();
            int changed=jdbc.update("UPDATE community_image_review_jobs SET state=?,available_at=? WHERE image_id=? AND state='LEASED' AND lease_token=?",
                claim.attempt()>=3?"DONE":"READY",time(now.plusSeconds(30L*claim.attempt())),claim.imageId(),claim.lease());
            if(changed==1&&claim.attempt()>=3)jdbc.update("UPDATE community_images SET status='REVIEW' WHERE id=? AND status='PENDING'",claim.imageId());
        });
    }
    public void completeDirect(Claim claim,String verdict,Instant now) {
        if(!Set.of("PASS","REJECTED").contains(verdict))throw new IllegalArgumentException("Invalid verdict");
        tx.executeWithoutResult(ignored->{
            lock();
            int changed=jdbc.update("UPDATE community_image_review_jobs SET state='DONE',available_at=? WHERE image_id=? AND state='LEASED' AND lease_token=? AND direct_fallback",
                time(now),claim.imageId(),claim.lease());
            if(changed==1)jdbc.update("UPDATE community_images SET status=? WHERE id=? AND status='PENDING'",verdict,claim.imageId());
        });
    }
    public void receive(String trace,String verdict,Instant now) {
        validateTrace(trace);
        if(!Set.of("PASS","REVIEW","REJECTED").contains(verdict))throw new IllegalArgumentException("Invalid verdict");
        receiveVerdict(trace,verdict,now);
    }
    public void receiveDownloadFailure(String trace,Instant now) {
        validateTrace(trace);
        receiveVerdict(trace,"RETRY",now);
    }
    private void receiveVerdict(String trace,String verdict,Instant now) {
        tx.executeWithoutResult(ignored->{
            lock();
            jdbc.update("INSERT INTO community_image_callback_inbox(trace_id,verdict,received_at) VALUES(?,?,?) ON CONFLICT DO NOTHING",trace,verdict,time(now));
            apply(trace,now);
        });
    }
    private void apply(String trace,Instant now) {
        // A provider download error is not a content verdict. Retry with the
        // direct-upload checker instead of stranding the post in the review queue.
        jdbc.update("""
            UPDATE community_image_review_jobs j SET state='READY',trace_id=NULL,lease_token=NULL,available_at=?,direct_fallback=TRUE
            FROM community_image_callback_inbox c
            WHERE c.trace_id=? AND c.trace_id=j.trace_id AND c.verdict='RETRY'
              AND j.state='WAITING' AND j.attempts<3
            """,time(now.plusSeconds(5)),trace);
        jdbc.update("""
            UPDATE community_images i SET status='REVIEW'
            FROM community_image_review_jobs j,community_image_callback_inbox c
            WHERE c.trace_id=? AND c.trace_id=j.trace_id AND c.verdict='RETRY'
              AND j.image_id=i.id AND j.state='WAITING' AND j.attempts>=3 AND i.status='PENDING'
            """,trace);
        jdbc.update("""
            UPDATE community_images i SET status=c.verdict FROM community_image_review_jobs j,community_image_callback_inbox c
            WHERE c.trace_id=? AND j.trace_id=c.trace_id AND j.state='WAITING' AND i.id=j.image_id AND i.status='PENDING'
              AND c.verdict IN ('PASS','REVIEW','REJECTED')
            """,trace);
        finishTerminal();
    }
    private void finishTerminal(){jdbc.update("UPDATE community_image_review_jobs j SET state='DONE' FROM community_images i WHERE i.id=j.image_id AND i.status<>'PENDING' AND j.state<>'DONE'");}
    private void lock(){jdbc.queryForObject("SELECT used_bytes FROM community_image_capacity WHERE id=1 FOR UPDATE",Long.class);}
    private static OffsetDateTime time(Instant instant){return instant.atOffset(ZoneOffset.UTC);}
    private static void validateTrace(String trace){if(trace==null||!trace.matches("[A-Za-z0-9_-]{1,128}"))throw new IllegalArgumentException("Invalid review trace");}
}
