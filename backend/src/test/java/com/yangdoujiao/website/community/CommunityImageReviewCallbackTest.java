package com.yangdoujiao.website.community;

import java.io.ByteArrayInputStream;
import java.time.Clock;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CommunityImageReviewCallbackTest {
    @Test void logsSafeReasonsWithoutPublishingAmbiguousResultsOrLeakingPayloads() throws Exception {
        var crypto=mock(WechatImageCallbackCrypto.class);
        var jobs=mock(CommunityImageReviewJobs.class);
        var handler=new CommunityImageReviewCallback(crypto,jobs,new ObjectMapper(),Clock.systemUTC());
        var logger=(ch.qos.logback.classic.Logger)org.slf4j.LoggerFactory.getLogger(CommunityImageReviewCallback.class);
        var events=new ch.qos.logback.core.read.ListAppender<ch.qos.logback.classic.spi.ILoggingEvent>();
        events.start();logger.addAppender(events);
        try {
            String[][] cases={
                {"0","review","MANUAL_REVIEW","REVIEW","0","review"},
                {"-1008","pass","PROVIDER_ERROR","REVIEW","-1008","pass"},
                {"null","pass","INVALID_PROVIDER_CODE","REVIEW","unknown","pass"},
                {"0","secret-openid","UNKNOWN_SUGGESTION","REVIEW","0","unknown"},
                {"0","pass","PASS","PASS","0","pass"},
                {"0","risky","REJECTED","REJECTED","0","risky"}
            };
            for(int i=0;i<cases.length;i++) {
                var row=cases[i];
                when(crypto.decrypt("signature","1","2","ciphertext")).thenReturn(
                    "{\"Event\":\"wxa_media_check\",\"trace_id\":\"trace-"+i+"\",\"errcode\":"+row[0]+
                    ",\"errmsg\":\"secret-token\",\"openid\":\"secret-openid\",\"result\":{\"suggest\":\""+row[1]+"\"}}");
                assertEquals("success",handler.receive("signature","1","2",stream("{\"Encrypt\":\"ciphertext\"}")));
                verify(jobs).receive(eq("trace-"+i),eq(row[3]),any());
                assertEquals(i+1,events.list.size());
                String message=events.list.get(i).getFormattedMessage();
                assertTrue(message.contains("reason="+row[2]));
                assertTrue(message.contains("providerCode="+row[4]));
                assertTrue(message.contains("suggestion="+row[5]));
                assertFalse(message.contains("secret-"));
                assertFalse(message.contains("trace-"));
                assertFalse(message.contains("ciphertext"));
            }
        } finally {logger.detachAppender(events);events.stop();}
    }
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
