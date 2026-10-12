package com.yangdoujiao.website.community;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import javax.crypto.Cipher;
import javax.crypto.spec.*;

/** WeChat security-mode JSON envelope. Never logs decrypted content or credentials. */
final class WechatImageCallbackCrypto {
    private final String token,appId;
    private final byte[] key;
    WechatImageCallbackCrypto(String token,String encodingKey,String appId) {
        if(token==null||token.isBlank()||encodingKey==null||encodingKey.length()!=43||appId==null||appId.isBlank())throw invalid();
        this.token=token;this.appId=appId;this.key=Base64.getDecoder().decode(encodingKey+"=");
        if(key.length!=32)throw invalid();
    }
    boolean verify(String signature,String timestamp,String nonce) {
        return matches(signature,token,timestamp,nonce);
    }
    String decrypt(String signature,String timestamp,String nonce,String encrypted) {
        if(encrypted==null||encrypted.length()>96000||!matches(signature,token,timestamp,nonce,encrypted))throw invalid();
        try {
            Cipher cipher=Cipher.getInstance("AES/CBC/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new IvParameterSpec(key,0,16));
            byte[] bytes=cipher.doFinal(Base64.getDecoder().decode(encrypted));
            if(bytes.length<32)throw invalid();
            int pad=Byte.toUnsignedInt(bytes[bytes.length-1]);
            if(pad<1||pad>32||pad>bytes.length-20)throw invalid();
            for(int i=bytes.length-pad;i<bytes.length;i++)if(Byte.toUnsignedInt(bytes[i])!=pad)throw invalid();
            int end=bytes.length-pad,length=ByteBuffer.wrap(bytes,16,4).getInt();
            if(length<0||length>end-20)throw invalid();
            if(!appId.equals(new String(bytes,20+length,end-20-length,StandardCharsets.UTF_8)))throw invalid();
            return new String(bytes,20,length,StandardCharsets.UTF_8);
        } catch(GeneralSecurityException|IndexOutOfBoundsException e) {throw invalid();}
    }
    private static boolean matches(String signature,String...parts) {
        if(signature==null||!signature.matches("[0-9a-f]{40}")||Arrays.stream(parts).anyMatch(Objects::isNull))return false;
        try {
            Arrays.sort(parts);
            byte[] actual=MessageDigest.getInstance("SHA-1").digest(String.join("",parts).getBytes(StandardCharsets.UTF_8));
            return MessageDigest.isEqual(actual,HexFormat.of().parseHex(signature));
        }catch(NoSuchAlgorithmException impossible){throw new IllegalStateException(impossible);}
    }
    private static IllegalArgumentException invalid(){return new IllegalArgumentException("Invalid WeChat callback envelope");}
}
