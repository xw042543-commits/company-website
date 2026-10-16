package com.yangdoujiao.website.community;

import java.io.IOException;
import java.net.URI;
import java.util.Optional;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.ObjectMapper;

/** Direct-upload fallback when WeChat's URL-based checker cannot download an image. */
final class WechatDirectImageReviewGateway {
    private static final org.slf4j.Logger log=org.slf4j.LoggerFactory.getLogger(WechatDirectImageReviewGateway.class);
    private final WechatAccessTokenProvider tokens;
    private final CommunityImageAttachments images;
    private final ObjectMapper json;
    private final RestClient client;
    WechatDirectImageReviewGateway(WechatAccessTokenProvider tokens,CommunityImageAttachments images,ObjectMapper json,RestClient client) {
        this.tokens=tokens;this.images=images;this.json=json;this.client=client;
    }
    Optional<String> check(String imageId) {
        try {
            var token=tokens.accessToken();if(token.isEmpty())return Optional.empty();
            // WeChat's direct-upload endpoint accepts up to 1 MB and 750 x 1334 px.
            // The server re-encodes this thumbnail to at most 480 px on either side.
            byte[] jpeg=images.read(imageId,true,null,true);
            if(jpeg.length<4||jpeg.length>1024*1024||(jpeg[0]&255)!=255||(jpeg[1]&255)!=216)return Optional.empty();
            URI uri=UriComponentsBuilder.fromUriString("https://api.weixin.qq.com/wxa/img_sec_check")
                .queryParam("access_token",token.get()).build().encode().toUri();
            var headers=new HttpHeaders();headers.setContentType(MediaType.IMAGE_JPEG);
            var resource=new ByteArrayResource(jpeg) {@Override public String getFilename(){return "review.jpg";}};
            var body=new LinkedMultiValueMap<String,Object>();
            body.add("media",new HttpEntity<>(resource,headers));
            return client.post().uri(uri).contentType(MediaType.MULTIPART_FORM_DATA).body(body)
                .exchange((request,response)->{
                    if(!response.getStatusCode().is2xxSuccessful())return Optional.<String>empty();
                    byte[] reply=response.getBody().readNBytes(16385);
                    if(reply.length==0||reply.length>16384)return Optional.<String>empty();
                    var code=json.readTree(reply).path("errcode");
                    if(!code.isIntegralNumber()||!code.canConvertToInt())return Optional.<String>empty();
                    int providerCode=code.intValue();
                    return switch(providerCode) {
                        case 0 -> Optional.of("PASS");
                        case 87014 -> Optional.of("REJECTED");
                        default -> {
                            log.warn("community direct image review rejected providerCode={}",providerCode);
                            yield Optional.empty();
                        }
                    };
                });
        }catch(IOException|RuntimeException e) {
            // Never log provider response text, access tokens, image data or paths.
            log.warn("community direct image review unavailable failureType={}",e.getClass().getSimpleName());
            return Optional.empty();
        }
    }
}
