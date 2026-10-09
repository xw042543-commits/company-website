package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import org.springframework.data.domain.PageRequest;

/** Called after the author account lock; exposes only a safe category and actual expiry. */
final class CommunityRestrictionGuard {
    private CommunityRestrictionGuard() {}
    static void requireAllowed(CommunityUserRestrictionRepository restrictions, long actorId, OffsetDateTime now) {
        var active=restrictions.findActiveForDisplay(actorId,now,PageRequest.of(0,1));
        if(!active.isEmpty()) {
            var restriction=active.getFirst();
            boolean ban=restriction.getRestrictionType()==CommunityRestrictionType.BANNED;
            throw new CommunityRestrictedException(new CommunityRestrictedException.Details(ban?"BAN":"MUTE",ban?null:restriction.getEndsAt()));
        }
    }
}
