package com.yangdoujiao.website.community;

import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import com.yangdoujiao.website.common.exception.ApiException;

final class CommunityRestrictedException extends ApiException {
    private final Details details;
    CommunityRestrictedException(Details details) {
        super(HttpStatus.FORBIDDEN,"COMMUNITY_USER_RESTRICTED","Community account is restricted");
        this.details=details;
    }
    Details details() { return details; }
    record Details(String restrictionKind, OffsetDateTime endsAt) {}
}
