package com.yangdoujiao.website.community;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class WechatImageCallbackCryptoTest {
    // Public fixture from WeChat's message-push documentation; not production credentials.
    static final String ENCRYPTED="+qdx1OKCy+5JPCBFWw70tm0fJGb2Jmeia4FCB7kao+/Q5c/ohsOzQHi8khUOb05JCpj0JB4RvQMkUyus8TPxLKJGQqcvZqzDpVzazhZv6JsXUnnR8XGT740XgXZUXQ7vJVnAG+tE8NUd4yFyjPy7GgiaviNrlCTj+l5kdfMuFUPpRSrfMZuMcp3Fn2Pede2IuQrKEYwKSqFIZoNqJ4M8EajAsjLY2km32IIjdf8YL/P50F7mStwntrA2cPDrM1kb6mOcfBgRtWygb3VIYnSeOBrebufAlr7F9mFUPAJGj04=";
    static final String SIGNATURE="046e02f8204d34f8ba5fa3b1db94908f3df2e9b3";
    final WechatImageCallbackCrypto crypto=new WechatImageCallbackCrypto("AAAAA","A".repeat(43),"wxba5fad812f8e6fb9");
    @Test void decryptsOfficialFixtureAndChecksGetChallenge() {
        assertEquals("{\"ToUserName\":\"gh_97417a04a28d\",\"FromUserName\":\"o9AgO5Kd5ggOC-bXrbNODIiE3bGY\",\"CreateTime\":1714112445,\"MsgType\":\"event\",\"Event\":\"debug_demo\",\"debug_str\":\"hello world\"}",
            crypto.decrypt(SIGNATURE,"1714112445","415670741",ENCRYPTED));
        assertTrue(crypto.verify("f464b24fc39322e44b38aa78f5edd27bd1441696","1714036504","1514711492"));
    }
    @Test void rejectsTamperedSignatureBodyAndAppIdentity() {
        assertThrows(IllegalArgumentException.class,()->crypto.decrypt("0".repeat(40),"1714112445","415670741",ENCRYPTED));
        assertThrows(IllegalArgumentException.class,()->crypto.decrypt(SIGNATURE,"1714112445","415670741","A"+ENCRYPTED.substring(1)));
        var other=new WechatImageCallbackCrypto("AAAAA","A".repeat(43),"other-app");
        assertThrows(IllegalArgumentException.class,()->other.decrypt(SIGNATURE,"1714112445","415670741",ENCRYPTED));
        assertThrows(IllegalArgumentException.class,()->new WechatImageCallbackCrypto("AAAAA","bad","app"));
    }
}
