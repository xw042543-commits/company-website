package com.yangdoujiao.website.community;

import com.yangdoujiao.website.notification.NotificationService;
import org.springframework.stereotype.Component;

/** Called inside the content mutation transaction, only after its public visibility is established. */
@Component
class CommunityNotificationPublisher {
    private final NotificationService inbox;
    CommunityNotificationPublisher(NotificationService inbox) { this.inbox=inbox; }
    void comment(CommunityPost post,CommunityComment comment) {
        if(post.getStatus()!=CommunityContentStatus.PUBLISHED||comment.getStatus()!=CommunityContentStatus.PUBLISHED) return;
        long recipient=comment.getParentCommentId()==null?post.getAuthorAccountId():comment.getReplyToAccountId();
        inbox.publishCommunity(recipient,comment.getAuthorAccountId(),"community:comment:"+comment.getId(),post.getId(),
                comment.getParentCommentId()==null?"收到新评论":"收到新回复",
                comment.getParentCommentId()==null?"有人评论了你的帖子，点击查看。":"有人回复了你的评论，点击查看。");
    }
    void like(long actor,CommunityTargetType type,long targetId,CommunityPost post,CommunityComment comment) {
        inbox.publishCommunity(comment==null?post.getAuthorAccountId():comment.getAuthorAccountId(),actor,
                "community:like:"+type+":"+targetId+":"+actor,post.getId(),"收到新点赞",
                comment==null?"有人赞了你的帖子，点击查看。":"有人赞了你的评论，点击查看。");
    }
}
