package com.yangdoujiao.website.community;

import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Stream;
import com.yangdoujiao.website.auth.miniapp.MiniappAuthProperties;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

/** Deployment owns the policy terms. No personal data or example detection terms ship in the default policy. */
@Component
public class ConfiguredCommunityRiskPolicy implements CommunityRiskPolicy {
    private final CommunityProperties properties;
    private final Environment environment;
    private final CommunityContentSafetyProperties safety;
    private final MiniappAuthProperties auth;
    private static final Set<String> EXAMPLE_TERMS = Set.of("synthetic-review", "hard-reject", "needs-review",
            "example-review", "example-reject");

    public ConfiguredCommunityRiskPolicy(CommunityProperties properties, Environment environment,
            CommunityContentSafetyProperties safety, MiniappAuthProperties auth) {
        this.properties = properties; this.environment = environment;
        this.safety = safety; this.auth = auth;
    }
    @PostConstruct void requireProductionPolicy() {
        if (!environment.acceptsProfiles(Profiles.of("prod")) || !properties.enabled()) return;
        if (properties.reviewTerms().isEmpty() || Stream.concat(properties.reviewTerms().stream(),
                properties.rejectTerms().stream()).map(term -> term.strip().toLowerCase(Locale.ROOT))
                .anyMatch(EXAMPLE_TERMS::contains))
            throw new IllegalStateException("Enabled production community requires owned local review rules");
        if (!safety.enabled() || !auth.enabled() || auth.localProviderEnabled()
                || blank(auth.wechatAppId()) || blank(auth.wechatAppSecret()))
            throw new IllegalStateException("Enabled production community requires WeChat content safety and miniapp credentials");
        if (!URI.create("https://api.weixin.qq.com/cgi-bin/token").equals(safety.accessTokenEndpoint())
                || !URI.create("https://api.weixin.qq.com/wxa/msg_sec_check").equals(safety.messageCheckEndpoint()))
            throw new IllegalStateException("Production community content safety requires official HTTPS endpoints");
    }
    private static boolean blank(String value) { return value == null || value.isBlank(); }
    public RiskDecision classify(String normalizedText) {
        if (properties.rejectTerms().stream().anyMatch(normalizedText::contains)) return RiskDecision.REJECT;
        if (properties.reviewTerms().stream().anyMatch(normalizedText::contains)) return RiskDecision.REVIEW;
        return RiskDecision.PUBLISH;
    }
}
