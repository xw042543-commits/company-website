package com.yangdoujiao.website.community;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Clock;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

final class CommunityImageReviewAccess {
    private final String origin,secret;
    private final Clock clock;
    CommunityImageReviewAccess(String origin,String secret,Clock clock) {
        URI uri=URI.create(origin);
        if(!"https".equals(uri.getScheme())||uri.getHost()==null||uri.getUserInfo()!=null||uri.getQuery()!=null||uri.getFragment()!=null
            ||!(uri.getPath().isEmpty()||uri.getPath().equals("/"))||secret==null||secret.length()<32)
            throw new IllegalArgumentException("HTTPS origin and a strong image review secret are required");
        this.origin=origin.endsWith("/")?origin.substring(0,origin.length()-1):origin;this.secret=secret;this.clock=clock;
    }
    String url(String id) {
        if(!id.matches("[0-9a-f]{32}"))throw new IllegalArgumentException("Invalid image ID");
        long expires=clock.instant().getEpochSecond()+3600;
        return origin+"/api/v1/community/image-review/media/"+id+"?expires="+expires+"&signature="+sign(id,expires);
    }
    boolean verify(String id,long expires,String signature) {
        long now=clock.instant().getEpochSecond();
        if(id==null||!id.matches("[0-9a-f]{32}")||expires<=now||expires-now>3600||signature==null||!signature.matches("[0-9a-f]{64}"))return false;
        return MessageDigest.isEqual(HexFormat.of().parseHex(signature),HexFormat.of().parseHex(sign(id,expires)));
    }
    private String sign(String id,long expires) {
        try {
            Mac mac=Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(("community-image-review\n"+id+"\n"+expires).getBytes(StandardCharsets.UTF_8)));
        }catch(GeneralSecurityException impossible){throw new IllegalStateException(impossible);}
    }
}
