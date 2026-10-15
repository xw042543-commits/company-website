package com.yangdoujiao.website.community;

import java.io.IOException;
import java.nio.file.Path;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.community.media.LocalCommunityImageStorage;
import tools.jackson.databind.JsonNode;

@Service
public class CommunityImageAttachments {
    private final CommunityImageAttachmentRepository repository;
    private final boolean enabled;
    private final String root;
    public record Image(String id,int width,int height,String url,String thumbnailUrl) {}
    public CommunityImageAttachments(CommunityImageAttachmentRepository repository,@Value("${app.community.images.enabled:false}") boolean enabled,
            @Value("${app.community.images.root:}") String root) {
        this.repository=repository;this.enabled=enabled;this.root=root;
    }
    public static List<String> parse(JsonNode value) {
        if(value==null || value.isNull())return List.of();
        if(!value.isArray() || value.size()>9)throw invalid();
        var ids=new ArrayList<String>();
        for(JsonNode item:value) {
            if(!item.isTextual() || !item.textValue().matches("[0-9a-f]{32}") || ids.contains(item.textValue()))throw invalid();
            ids.add(item.textValue());
        }
        return List.copyOf(ids);
    }
    @Transactional(propagation=org.springframework.transaction.annotation.Propagation.MANDATORY)
    public void bind(long owner,long post,List<String> ids,boolean textPassed) {
        if(ids.isEmpty())return;
        if(!enabled)throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"COMMUNITY_IMAGES_DISABLED","Image publishing is disabled");
        repository.bind(owner,post,ids,textPassed);
    }
    @Transactional public void recordResult(String imageId,String result){repository.recordResult(imageId,result);}
    public boolean hasImages(long postId){return repository.hasImages(postId);}
    public boolean readyForManualApproval(long postId,boolean requireCompletedScan){return repository.readyForManualApproval(postId,requireCompletedScan);}
    public Map<String,List<Image>> forPosts(List<Long> posts,Long viewer,boolean adviser){return repository.forPosts(posts,viewer,adviser);}
    public byte[] read(String id,boolean thumbnail,Long viewer,boolean adviser)throws IOException {
        if(id==null||!id.matches("[0-9a-f]{32}"))throw missing();
        String key=repository.visibleStorageKey(id,viewer,adviser).orElseThrow(CommunityImageAttachments::missing);
        if(root.isBlank())throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,"COMMUNITY_IMAGE_STORAGE_UNAVAILABLE","Image storage unavailable");
        return new LocalCommunityImageStorage(Path.of(root)).read(key,thumbnail);
    }
    private static ApiException invalid(){return new ApiException(HttpStatus.BAD_REQUEST,"INVALID_COMMUNITY_IMAGES","Images must be owned, unbound and uploaded within 24 hours");}
    private static ApiException missing(){return new ApiException(HttpStatus.NOT_FOUND,"COMMUNITY_IMAGE_NOT_FOUND","Image unavailable");}
}
