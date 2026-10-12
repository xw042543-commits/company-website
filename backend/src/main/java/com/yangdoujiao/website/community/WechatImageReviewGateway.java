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
    WechatImageReviewGateway(WechatAccessTokenProvider tokens,UserExternalIdentityRepository identities,
            CommunityImageReviewAccess access,ObjectMapper json,RestClient client) {
        this.tokens=tokens;this.identities=identities;this.access=access;this.json=json;this.client=client;
    }
    Optional<String> submit(long owner,String imageId) {
        try {
            var openid=identities.findProviderSubjectByProviderAndUserAccountId(ExternalIdentityProvider.WECHAT_MINI_PROGRAM,owner);
            if(openid.isEmpty())return Optional.empty();
            var token=tokens.accessToken();if(token.isEmpty())return Optional.empty();
            URI uri=UriComponentsBuilder.fromUriString("https://api.weixin.qq.com/wxa/media_check_async")
                .queryParam("access_token",token.get()).build().encode().toUri();
            byte[] payload=json.writeValueAsBytes(Map.of("media_url",access.url(imageId),"media_type",2,"version",2,"scene",3,"openid",openid.get()));
            return client.post().uri(uri).contentType(MediaType.APPLICATION_JSON).contentLength(payload.length).body(payload)
                .exchange((request,response)->{
                    if(!response.getStatusCode().is2xxSuccessful())return Optional.<String>empty();
                    byte[] body=response.getBody().readNBytes(16385);
                    if(body.length==0||body.length>16384)return Optional.<String>empty();
                    JsonNode data=json.readTree(body),code=data.path("errcode"),trace=data.path("trace_id");
                    if(!code.isIntegralNumber()||code.longValue()!=0||!trace.isTextual()||!trace.asText().matches("[A-Za-z0-9_-]{1,128}"))return Optional.<String>empty();
                    return Optional.of(trace.asText());
                });
        }catch(RuntimeException e) {
            // Upstream exception messages may contain access tokens or signed URLs.
            org.slf4j.LoggerFactory.getLogger(getClass()).warn("community image review unavailable failureType={}",e.getClass().getSimpleName());
            return Optional.empty();
        }
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
