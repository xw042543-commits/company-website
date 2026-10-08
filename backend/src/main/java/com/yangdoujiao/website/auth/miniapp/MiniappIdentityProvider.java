package com.yangdoujiao.website.auth.miniapp;

public interface MiniappIdentityProvider {
    MiniappProviderIdentity exchange(String code);
}
