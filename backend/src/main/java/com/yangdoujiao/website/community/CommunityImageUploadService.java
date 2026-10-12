package com.yangdoujiao.website.community;

import java.io.IOException;
import java.time.*;
import java.util.UUID;
import java.util.function.BooleanSupplier;
import java.util.function.LongSupplier;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import com.yangdoujiao.website.auth.account.*;
import com.yangdoujiao.website.community.media.*;
import com.yangdoujiao.website.common.exception.ApiException;

/** Upload does not imply publication. No public URL is returned by this service. */
public final class CommunityImageUploadService {
    private final CommunityImageRepository images;
    private final UserAccountRepository accounts;
    private final CommunityUserRestrictionRepository restrictions;
    private final CommunityImageStorage storage;
    private final TransactionTemplate transactions;
    private final Clock clock;
    private final BooleanSupplier enabled;
    private final LongSupplier usableSpace;
    private final long maxBytes;
    public record Upload(String id,int width,int height,String status) {}
    public CommunityImageUploadService(CommunityImageRepository images,UserAccountRepository accounts,
            CommunityUserRestrictionRepository restrictions,CommunityImageStorage storage,
            TransactionTemplate transactions,Clock clock,BooleanSupplier enabled,LongSupplier usableSpace,long maxBytes) {
        if(maxBytes<1) throw new IllegalArgumentException("Image capacity must be positive");
        this.images=images;this.accounts=accounts;this.restrictions=restrictions;this.storage=storage;
        this.transactions=transactions;this.clock=clock;this.enabled=enabled;this.usableSpace=usableSpace;this.maxBytes=maxBytes;
    }
    public Upload upload(long actorId,byte[] content) {
        if(!enabled.getAsBoolean()) throw error(HttpStatus.SERVICE_UNAVAILABLE,"COMMUNITY_DISABLED");
        final EncodedCommunityImage image;
        try { image=new CommunityImageCodec().encode(content); }
        catch(IllegalArgumentException e) { throw error(HttpStatus.BAD_REQUEST,"INVALID_COMMUNITY_IMAGE"); }
        return transactions.execute(ignored -> {
            var account=accounts.findLockedById(actorId).orElseThrow(()->error(HttpStatus.UNAUTHORIZED,"AUTHENTICATION_REQUIRED"));
            if(account.getStatus()!=UserAccountStatus.ACTIVE) throw error(HttpStatus.FORBIDDEN,"COMMUNITY_USER_RESTRICTED");
            var now=OffsetDateTime.ofInstant(clock.instant(),ZoneOffset.UTC);
            CommunityRestrictionGuard.requireAllowed(restrictions,actorId,now);
            long used=images.lockCapacity();
            if(images.countSince(actorId,now.toLocalDate().atStartOfDay().atOffset(ZoneOffset.UTC))>=90)
                throw error(HttpStatus.TOO_MANY_REQUESTS,"COMMUNITY_IMAGE_DAILY_LIMIT");
            long bytes=(long)image.display().length+image.thumbnail().length;
            if(used>maxBytes || bytes>maxBytes-used || usableSpace.getAsLong()-bytes<2L*1024*1024*1024)
                throw error(HttpStatus.INSUFFICIENT_STORAGE,"COMMUNITY_IMAGE_CAPACITY");
            final String key;
            try { key=storage.save(image); }
            catch(IOException e) { throw error(HttpStatus.SERVICE_UNAVAILABLE,"COMMUNITY_IMAGE_STORAGE_UNAVAILABLE"); }
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCompletion(int status) {
                    if(status!=STATUS_COMMITTED) {
                        try { storage.delete(key); }
                        catch(IOException e) {
                            org.slf4j.LoggerFactory.getLogger(CommunityImageUploadService.class)
                                .error("Community image rollback cleanup failed; orphan reconciliation required");
                        }
                    }
                }
            });
            String id=UUID.randomUUID().toString().replace("-","");
            images.insert(id,actorId,key,image.width(),image.height(),bytes,now);
            return new Upload(id,image.width(),image.height(),"PENDING");
        });
    }
    private static ApiException error(HttpStatus status,String code) {
        return new ApiException(status,code,"Image upload is unavailable for this request");
    }
}
