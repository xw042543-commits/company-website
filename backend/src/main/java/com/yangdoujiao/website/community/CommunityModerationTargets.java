package com.yangdoujiao.website.community;

import java.time.Clock;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.dao.DataAccessException;
import org.springframework.transaction.support.*;
import com.yangdoujiao.website.common.exception.ApiException;

/** All callers own a transaction and take account locks before this consistent target-lock suffix. */
@Component
class CommunityModerationTargets {
    final CommunityPostRepository posts;
    final CommunityCommentRepository comments;
    final CommunityReactionRepository reactions;
    final StringRedisTemplate redis;
    final Clock clock;
    CommunityModerationTargets(CommunityPostRepository posts, CommunityCommentRepository comments,
            CommunityReactionRepository reactions, StringRedisTemplate redis, Clock clock) {
        this.posts=posts;this.comments=comments;this.reactions=reactions;this.redis=redis;this.clock=clock;
    }
    long author(CommunityTargetType type,long id) {
        return (type==CommunityTargetType.POST?posts.findAuthorIdById(id):comments.findAuthorIdById(id))
                .orElseThrow(()->missing(type));
    }
    Target lock(CommunityTargetType type,long id) {
        if(type==CommunityTargetType.POST) return new Target(posts.findLockedById(id).orElseThrow(()->missing(type)),null,null);
        var location=comments.findLocationById(id).orElseThrow(()->missing(type));
        var post=posts.findLockedById(location.getPostId()).orElseThrow(()->missing(CommunityTargetType.POST));
        var root=location.getParentId()==null?null:comments.findLockedById(location.getParentId()).orElseThrow(()->missing(type));
        return new Target(post,root,comments.findLockedById(id).orElseThrow(()->missing(type)));
    }
    void reconcile(Target target) {
        // Flush visibility before querying exact public counts. Never erase retained reactions/evidence.
        posts.flush();
        target.post().reconcileCounts(Math.toIntExact(reactions.countByTargetTypeAndTargetId(CommunityTargetType.POST,target.post().getId())),
                target.post().getStatus()==CommunityContentStatus.PUBLISHED?Math.toIntExact(comments.countPublicComments(target.post().getId())):0,now());
        if(target.comment()!=null)target.comment().reconcileLikeCount(Math.toIntExact(reactions.countByTargetTypeAndTargetId(
                CommunityTargetType.COMMENT,target.comment().getId())),now());
    }
    void invalidateAfterCommit() {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit(){try{redis.delete("community:hot:v1:current");}catch(DataAccessException ignored){}}
        });
    }
    OffsetDateTime now(){return OffsetDateTime.now(clock);}
    static ApiException missing(CommunityTargetType type){return new ApiException(HttpStatus.NOT_FOUND,"COMMUNITY_"+type+"_NOT_FOUND","Community target does not exist");}
    record Target(CommunityPost post,CommunityComment root,CommunityComment comment) {
        long id(){return comment==null?post.getId():comment.getId();}
        long version(){return comment==null?post.getVersion():comment.getVersion();}
        CommunityContentStatus status(){return comment==null?post.getStatus():comment.getStatus();}
        boolean publishedAncestors(){
            return comment==null||post.getStatus()==CommunityContentStatus.PUBLISHED
                    &&(root==null||root.getStatus()==CommunityContentStatus.PUBLISHED&&root.getParentCommentId()==null
                        &&root.getPostId().equals(post.getId()));
        }
        boolean publicTarget(){return status()==CommunityContentStatus.PUBLISHED&&publishedAncestors();}
        boolean reportable(){return (status()==CommunityContentStatus.PUBLISHED||status()==CommunityContentStatus.HIDDEN)&&publishedAncestors();}
        void decide(CommunityContentStatus status,OffsetDateTime now){
            // Advance optimistic version even on decisions that keep content status (mute, ban, report rejection).
            OffsetDateTime previous=comment==null?post.getUpdatedAt():comment.getUpdatedAt();
            var timestamp=now.isAfter(previous)?now:previous.plusNanos(1000);
            if(comment==null)post.changeStatus(status,timestamp);else comment.changeStatus(status,timestamp);
        }
    }
}
