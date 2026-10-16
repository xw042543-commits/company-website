package com.yangdoujiao.website.community;

import java.io.IOException;
import java.net.URI;
import java.util.Optional;
import org.springframework.http.*;
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
            String boundary="----udajo-"+java.util.UUID.randomUUID();
            byte[] body=multipart(jpeg,boundary);
            MediaType type=MediaType.parseMediaType("multipart/form-data; boundary="+boundary);
            return client.post().uri(uri).contentType(type).contentLength(body.length).body(body)
                .exchange((request,response)->{
                    if(!response.getStatusCode().is2xxSuccessful())return unavailable("HttpStatus"+response.getStatusCode().value());
                    byte[] reply=response.getBody().readNBytes(16385);
                    if(reply.length==0)return unavailable("EmptyProviderResponse");
                    if(reply.length>16384)return unavailable("OversizedProviderResponse");
                    var code=json.readTree(reply).path("errcode");
                    if(!code.isIntegralNumber()||!code.canConvertToInt())return unavailable("InvalidProviderResponse");
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
    private static Optional<String> unavailable(String failureType) {
        log.warn("community direct image review unavailable failureType={}",failureType);
        return Optional.empty();
    }
    private static byte[] multipart(byte[] jpeg,String boundary)throws IOException {
        var output=new java.io.ByteArrayOutputStream(jpeg.length+256);
        output.write(("--"+boundary+"\r\n"
            +"Content-Disposition: form-data; name=\"media\"; filename=\"review.jpg\"\r\n"
            +"Content-Type: image/jpeg\r\n\r\n").getBytes(java.nio.charset.StandardCharsets.US_ASCII));
        output.write(jpeg);
        output.write(("\r\n--"+boundary+"--\r\n").getBytes(java.nio.charset.StandardCharsets.US_ASCII));
        return output.toByteArray();
    }
}
