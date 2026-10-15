package com.yangdoujiao.website.community;

import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.http.HttpStatus;
import com.yangdoujiao.website.common.exception.ApiException;

@Repository
public class CommunityImageAttachmentRepository {
    private final JdbcTemplate jdbc;
    private final Clock clock;
    public CommunityImageAttachmentRepository(JdbcTemplate jdbc,Clock clock){this.jdbc=jdbc;this.clock=clock;}
    /** Caller holds the author's account lock and transaction. */
    public void bind(long owner,long post,List<String> ids,boolean textPassed,boolean reviewEnabled) {
        if(ids.isEmpty())return;
        if(ids.size()>9 || new HashSet<>(ids).size()!=ids.size())throw invalid();
        lock();
        for(int position=0;position<ids.size();position++) {
            int changed=jdbc.update("UPDATE community_images SET post_id=?,position=? WHERE id=? AND owner_account_id=? AND post_id IS NULL AND created_at>?",
                post,position,ids.get(position),owner,OffsetDateTime.now(clock).minusHours(24));
            if(changed!=1)throw invalid();
            if(reviewEnabled)jdbc.update("INSERT INTO community_image_review_jobs(image_id) VALUES(?)",ids.get(position));
        }
        if(reviewEnabled)jdbc.update("INSERT INTO community_image_post_review(post_id,text_passed) VALUES(?,?)",post,textPassed);
    }
    public void recordResult(String imageId,String result) {
        if(!List.of("PASS","REVIEW","REJECTED").contains(result))throw invalid();
        lock();
        // First terminal result wins; retries and late callbacks cannot reverse it.
        jdbc.update("UPDATE community_images SET status=? WHERE id=? AND status='PENDING'",result,imageId);
        reconcile();
    }
    public void reconcile() {
        // Only an approved text verdict and a PASS for every image can publish automatically.
        // Version zero ensures a later manual decision or author deletion cannot be undone.
        jdbc.update("""
            WITH approved AS (UPDATE community_posts p SET status='PUBLISHED',published_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP,version=version+1
            FROM community_image_post_review r WHERE r.post_id=p.id AND r.text_passed
              AND p.status='PENDING_REVIEW' AND p.version=0
              AND EXISTS(SELECT 1 FROM community_images i WHERE i.post_id=p.id)
              AND NOT EXISTS(SELECT 1 FROM community_images i WHERE i.post_id=p.id AND i.status<>'PASS')
            RETURNING p.id,p.author_account_id)
            INSERT INTO inbox_notifications(recipient_account_id,event_key,category,title,body,target_type,created_at)
            SELECT author_account_id,'community:image-approved:'||id,'SYSTEM','U圈内容检查结果',
              '你的帖子已自动发布，可在“我的内容”查看。','NONE',CURRENT_TIMESTAMP FROM approved
            ON CONFLICT(recipient_account_id,event_key) DO NOTHING
            """);
    }
    public Map<String,List<CommunityImageAttachments.Image>> forPosts(List<Long> posts,Long viewer,boolean adviser) {
        if(posts.isEmpty())return Map.of();
        if(posts.size()>50 || posts.stream().anyMatch(id->id==null || id<1))throw invalid();
        String marks=String.join(",",Collections.nCopies(posts.size(),"?"));
        var args=new ArrayList<Object>(posts);args.add(viewer);args.add(adviser);
        var result=new LinkedHashMap<String,List<CommunityImageAttachments.Image>>();
        jdbc.query("SELECT i.id,i.post_id,i.width,i.height FROM community_images i JOIN community_posts p ON p.id=i.post_id WHERE p.id IN ("+marks+") AND p.status<>'DELETED' AND (p.status='PUBLISHED' OR p.author_account_id=? OR ?) ORDER BY i.post_id,i.position",
            rs->{String id=rs.getString("id"),post=rs.getString("post_id");
                String url="/api/v1/community/images/"+id;
                result.computeIfAbsent(post,k->new ArrayList<>()).add(new CommunityImageAttachments.Image(id,rs.getInt("width"),rs.getInt("height"),url,url+"?thumbnail=true"));},args.toArray());
        return result;
    }

    public Optional<String> visibleStorageKey(String id,Long viewer,boolean adviser) {
        return jdbc.queryForList("""
            SELECT i.storage_key FROM community_images i LEFT JOIN community_posts p ON p.id=i.post_id
            WHERE i.id=? AND (p.status IS NULL OR p.status<>'DELETED')
              AND (p.status='PUBLISHED' OR i.owner_account_id=? OR ?)
            """,String.class,id,viewer,adviser).stream().findFirst();
    }
    private void lock(){jdbc.queryForObject("SELECT used_bytes FROM community_image_capacity WHERE id=1 FOR UPDATE",Long.class);}
    private static ApiException invalid(){return new ApiException(HttpStatus.BAD_REQUEST,"INVALID_COMMUNITY_IMAGES","Images must be owned, unbound and uploaded within 24 hours");}
}
