package com.yangdoujiao.website.auth.wechat;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class WechatReturnTargetTest {
    @Test
    void acceptsOnlyLocalPathsForTheRequestedLocale() {
        assertThat(WechatReturnTarget.normalize("zh", "/zh/account")).isEqualTo("/zh/account");
        assertThat(WechatReturnTarget.normalize("en", "/en/universities?q=law"))
                .isEqualTo("/en/universities?q=law");
        assertThat(WechatReturnTarget.normalize("zh", "https://evil.example/zh/account"))
                .isEqualTo("/zh/account");
        assertThat(WechatReturnTarget.normalize("zh", "//evil.example/zh/account"))
                .isEqualTo("/zh/account");
        assertThat(WechatReturnTarget.normalize("zh", "/en/account")).isEqualTo("/zh/account");
        assertThat(WechatReturnTarget.normalize("en", "/en/\\evil")).isEqualTo("/en/account");
    }
}
