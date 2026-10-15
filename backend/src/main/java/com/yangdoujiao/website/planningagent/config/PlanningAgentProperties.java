package com.yangdoujiao.website.planningagent.config;

import java.math.BigDecimal;
import java.util.Set;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import com.yangdoujiao.website.planningagent.agent.PlanningModel;

@ConfigurationProperties("app.planning-agent")
public record PlanningAgentProperties(
        @DefaultValue("false") boolean enabled,
        @DefaultValue("") String vendor,
        @DefaultValue("") String processingRegion,
        @DefaultValue("") String privacyVersion,
        @DefaultValue("0") BigDecimal dailyCostCap,
        @DefaultValue("0") long dailyTokenCap,
        @DefaultValue("0") BigDecimal worstCaseRunCost,
        @DefaultValue("0") int maxInputTokens,
        @DefaultValue("0") int maxOutputTokens) {
    /** A real adapter must enforce both token ceilings and its reviewed pricing envelope.
     * No production implementation is bundled; naming a vendor alone cannot enable execution. */
    public interface ApprovedProvider extends PlanningModel {
        String vendor();
        String processingRegion();
        boolean pricingAndPrivacyApproved();
        com.yangdoujiao.website.planningagent.agent.AgentReply next(
                com.yangdoujiao.website.planningagent.agent.ModelContext context,int maxInputTokens,int maxOutputTokens);
        @Override default com.yangdoujiao.website.planningagent.agent.AgentReply next(
                com.yangdoujiao.website.planningagent.agent.ModelContext context) {
            throw new UnsupportedOperationException("Explicit token ceilings are required");
        }
    }
    public boolean available(PlanningModel model) {
        return enabled && Set.of("openai","azure-openai").contains(vendor)
                && processingRegion!=null && !processingRegion.isBlank()
                && privacyVersion!=null && !privacyVersion.isBlank() && privacyVersion.length()<=50
                && dailyCostCap!=null && dailyCostCap.signum()>0
                && worstCaseRunCost!=null && worstCaseRunCost.signum()>0
                && worstCaseRunCost.scale()<=8 && dailyCostCap.scale()<=8
                && dailyCostCap.compareTo(worstCaseRunCost)>=0
                && maxInputTokens>0 && maxOutputTokens>0
                && dailyTokenCap>=reservationTokens()
                && model instanceof ApprovedProvider provider && provider.pricingAndPrivacyApproved()
                && vendor.equals(provider.vendor()) && processingRegion.equals(provider.processingRegion());
    }
    public long reservationTokens() { return 10L*((long)maxInputTokens+maxOutputTokens); }
}
