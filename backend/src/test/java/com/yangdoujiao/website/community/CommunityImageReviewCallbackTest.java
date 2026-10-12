package com.yangdoujiao.website.community;

import java.io.ByteArrayInputStream;
import java.time.Clock;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class CommunityImageReviewCallbackTest {
    final CommunityImageReviewCallback callback=new CommunityImageReviewCallback(
        new WechatImageCallbackCrypto("AAAAA","A".repeat(43),"wxba5fad812f8e6fb9"),
        mock(CommunityImageReviewJobs.class),new ObjectMapper(),Clock.systemUTC());
    @Test void echoesOnlyAuthenticChallenge() {
        assertEquals("challenge",callback.challenge("f464b24fc39322e44b38aa78f5edd27bd1441696","1714036504","1514711492","challenge"));
        assertThrows(com.yangdoujiao.website.common.exception.ApiException.class,()->callback.challenge("bad","1714036504","1514711492","challenge"));
    }
    @Test void authenticUnrelatedEventIsAcknowledgedButPlaintextOrOversizeIsRejected() throws Exception {
        String payload="{\"Encrypt\":\""+WechatImageCallbackCryptoTest.ENCRYPTED+"\"}";
        assertEquals("success",callback.receive(WechatImageCallbackCryptoTest.SIGNATURE,"1714112445","415670741",stream(payload)));
        assertThrows(com.yangdoujiao.website.common.exception.ApiException.class,()->callback.receive("bad","1","2",stream("{\"Event\":\"wxa_media_check\"}")));
        assertThrows(com.yangdoujiao.website.common.exception.ApiException.class,()->callback.receive("bad","1","2",new ByteArrayInputStream(new byte[100001])));
        assertThrows(com.yangdoujiao.website.common.exception.ApiException.class,()->callback.receive("bad","1","2",stream("")));
        assertThrows(com.yangdoujiao.website.common.exception.ApiException.class,()->callback.receive("bad","1","2",stream("null")));
    }
    private ByteArrayInputStream stream(String value){return new ByteArrayInputStream(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));}
}
