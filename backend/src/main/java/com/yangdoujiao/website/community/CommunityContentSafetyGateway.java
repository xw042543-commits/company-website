package com.yangdoujiao.website.community;

/** Provider-neutral boundary for externally checking normalized user-generated text. */
public interface CommunityContentSafetyGateway {
    enum Result { PASS, REVIEW, UNAVAILABLE }

    Result check(long actorId, String normalizedText);
}
