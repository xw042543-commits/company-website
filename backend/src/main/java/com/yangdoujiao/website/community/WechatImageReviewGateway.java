package com.yangdoujiao.website.community;

import com.yangdoujiao.website.auth.external.*;
import java.util.*;
import java.net.URI;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.MediaType;
import tools.jackson.databind.*;

final class WechatImageReviewGateway {
    private final WechatAccessTokenProvider tokens;
    private final UserExternalIdentityRepository identities;
    private final CommunityImageReviewAccess access;
    private final ObjectMapper json;
    private final RestClient client;
    private final boolean diagnostics;
    WechatImageReviewGateway(WechatAccessTokenProvider tokens,UserExternalIdentityRepository identities,
            CommunityImageReviewAccess access,ObjectMapper json,RestClient client) {
        this(tokens,identities,access,json,client,false);
    }
    WechatImageReviewGateway(WechatAccessTokenProvider tokens,UserExternalIdentityRepository identities,
            CommunityImageReviewAccess access,ObjectMapper json,RestClient client,boolean diagnostics) {
        this.tokens=tokens;this.identities=identities;this.access=access;this.json=json;this.client=client;
        this.diagnostics=diagnostics;
    }
    Optional<String> submit(long owner,String imageId) {
        try {
            var openid=identities.findProviderSubjectByProviderAndUserAccountId(ExternalIdentityProvider.WECHAT_MINI_PROGRAM,owner);
            if(openid.isEmpty())return Optional.empty();
            var token=tokens.accessToken();if(token.isEmpty())return Optional.empty();
            URI uri=UriComponentsBuilder.fromUriString("https://api.weixin.qq.com/wxa/media_check_async")
                .queryParam("access_token",token.get()).build().encode().toUri();
            String mediaUrl=access.url(imageId);
            URI media=URI.create(mediaUrl);
            byte[] payload=json.writeValueAsBytes(Map.of("media_url",mediaUrl,"media_type",2,"version",2,"scene",3,"openid",openid.get()));
            if(diagnostics)diagnose(media);
            return client.post().uri(uri).contentType(MediaType.APPLICATION_JSON).contentLength(payload.length).body(payload)
                .exchange((request,response)->{
                    if(!response.getStatusCode().is2xxSuccessful())return Optional.<String>empty();
                    byte[] body=response.getBody().readNBytes(16385);
                    if(body.length==0||body.length>16384)return Optional.<String>empty();
                    JsonNode data=json.readTree(body),code=data.path("errcode"),trace=data.path("trace_id");
                    if(!code.isIntegralNumber()||code.longValue()!=0||!trace.isTextual()||!trace.asText().matches("[A-Za-z0-9_-]{1,128}"))return Optional.<String>empty();
                    // Never log the signed path, access token, openid or request payload.
                    org.slf4j.LoggerFactory.getLogger(getClass()).info(
                        "community image review submitted traceHash={} mediaHost={} mediaFormat=signed-jpeg-path ttlSeconds=3600 mediaHash={}",
                        traceHash(trace.asText()),media.getHost(),traceHash(mediaUrl));
                    return Optional.of(trace.asText());
                });
        }catch(RuntimeException e) {
            // Upstream exception messages may contain access tokens or signed URLs.
            org.slf4j.LoggerFactory.getLogger(getClass()).warn("community image review unavailable failureType={}",e.getClass().getSimpleName());
            return Optional.empty();
        }
    }
    private void diagnose(URI media) {
        var log=org.slf4j.LoggerFactory.getLogger(getClass());
        String hash=traceHash(media.toString());
        try {
            String[] parts=media.getPath().split("/");
            boolean valid="https".equals(media.getScheme())&&media.getUserInfo()==null
                &&media.getQuery()==null&&media.getFragment()==null&&parts.length==9
                &&media.getPath().startsWith("/api/v1/community/image-review/media/")
                &&parts[8].endsWith(".jpg")
                &&access.verify(parts[6],Long.parseLong(parts[7]),parts[8].substring(0,parts[8].length()-4));
            if(!valid) {
                log.info("community image review probe mediaHash={} urlValid=false",hash);
                return;
            }
            // Probe the exact URI serialized into the provider request. Never copy credentials,
            // follow redirects, log response bodies, or expose exception messages.
            client.get().uri(media).exchange((request,response)->{
                byte[] prefix=response.getBody().readNBytes(3);
                boolean jpeg=prefix.length==3&&(prefix[0]&255)==255&&(prefix[1]&255)==216&&(prefix[2]&255)==255;
                boolean jpegType=MediaType.IMAGE_JPEG.equals(response.getHeaders().getContentType());
                log.info("community image review probe mediaHash={} urlValid=true httpStatus={} jpegType={} jpegPrefix={} declaredLength={}",
                    hash,response.getStatusCode().value(),jpegType,jpeg,response.getHeaders().getContentLength());
                return null;
            });
        }catch(RuntimeException e) {
            log.warn("community image review probe mediaHash={} failureType={}",hash,e.getClass().getSimpleName());
        }
    }
    static String traceHash(String trace) {
        try {
            return HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                .digest(trace.getBytes(java.nio.charset.StandardCharsets.UTF_8))).substring(0,16);
        } catch(java.security.NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
    static String verdict(JsonNode data) {
        JsonNode code=data.path("errcode");
        if(!code.isIntegralNumber()||code.longValue()!=0)return "REVIEW";
        return switch(data.path("result").path("suggest").asText("")) {
            case "pass" -> "PASS";
            case "risky" -> "REJECTED";
            default -> "REVIEW";
        };
    }
}
