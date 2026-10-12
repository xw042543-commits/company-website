package com.yangdoujiao.website.community;

import com.yangdoujiao.website.notification.NotificationService;
import org.springframework.stereotype.Component;

/** Called inside the content mutation transaction; inbox rows roll back with the decision. */
@Component
class CommunityNotificationPublisher {
    private final NotificationService inbox;
    CommunityNotificationPublisher(NotificationService inbox) { this.inbox=inbox; }
    void moderation(CommunityModerationTargets.Target target,CommunityTargetType type,String command,long version,CommunityContentStatus before) {
        if(before==target.status())return;
        String content=type==CommunityTargetType.POST?"帖子":"评论";
        String body=switch(target.status()) {
            case PUBLISHED -> before==CommunityContentStatus.PENDING_REVIEW?"你的"+content+"已通过审核，可在“我的内容”查看。":"你的"+content+"已恢复公开展示，可在“我的内容”查看。";
            case REJECTED -> "你的"+content+"未通过审核，请修改后重新提交。";
            case HIDDEN -> "你的"+content+"已隐藏，可在“我的内容”查看当前状态。";
            default -> null;
        };
        if(body==null)return;
        long author=target.comment()==null?target.post().getAuthorAccountId():target.comment().getAuthorAccountId();
        // Locked source version distinguishes later hide/restore cycles; stale retries fail before publishing.
        inbox.publishSystem(author,"community:moderation:"+type+":"+target.id()+":"+command+":"+version,
                "U圈内容审核结果",body);
    }
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
