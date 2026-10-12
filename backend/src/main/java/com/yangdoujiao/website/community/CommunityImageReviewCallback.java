package com.yangdoujiao.website.community;

import java.io.*;
import java.time.Clock;
import com.yangdoujiao.website.common.exception.ApiException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/community/image-review/callback")
@ConditionalOnProperty(name="app.community.images.review-enabled",havingValue="true")
public class CommunityImageReviewCallback {
    private final WechatImageCallbackCrypto crypto;
    private final CommunityImageReviewJobs jobs;
    private final ObjectMapper json;
    private final Clock clock;
    CommunityImageReviewCallback(WechatImageCallbackCrypto crypto,CommunityImageReviewJobs jobs,ObjectMapper json,Clock clock) {
        this.crypto=crypto;this.jobs=jobs;this.json=json;this.clock=clock;
    }
    @GetMapping(produces="text/plain")
    public String challenge(@RequestParam String signature,@RequestParam String timestamp,@RequestParam String nonce,@RequestParam String echostr) {
        if(timestamp.length()>20||nonce.length()>128||echostr.length()>1024||!crypto.verify(signature,timestamp,nonce))throw rejected();
        return echostr;
    }
    @PostMapping(produces="text/plain")
    public String event(@RequestParam("msg_signature") String signature,@RequestParam String timestamp,@RequestParam String nonce,HttpServletRequest request)throws IOException {
        return receive(signature,timestamp,nonce,request.getInputStream());
    }
    String receive(String signature,String timestamp,String nonce,InputStream input)throws IOException {
        String trace,verdict;
        try {
            if(timestamp.length()>20||nonce.length()>128)throw rejected();
            byte[] bytes=input.readNBytes(100001);
            if(bytes.length>100000)throw rejected();
            var envelope=json.readTree(bytes);
            if(envelope==null||!envelope.isObject())throw rejected();
            var data=json.readTree(crypto.decrypt(signature,timestamp,nonce,envelope.path("Encrypt").asText(null)));
            if(data==null||!data.isObject())throw rejected();
            if(!"wxa_media_check".equals(data.path("Event").asText()))return "success";
            trace=data.path("trace_id").asText("");
            if(!trace.matches("[A-Za-z0-9_-]{1,128}"))throw rejected();
            verdict=WechatImageReviewGateway.verdict(data);
        }catch(IllegalArgumentException|tools.jackson.core.JacksonException e){throw rejected();}
        // A database failure must propagate so WeChat retries; do not acknowledge lost events.
        jobs.receive(trace,verdict,clock.instant());
        return "success";
    }
    private static ApiException rejected(){return new ApiException(HttpStatus.BAD_REQUEST,"INVALID_REVIEW_CALLBACK","Invalid callback");}
}
