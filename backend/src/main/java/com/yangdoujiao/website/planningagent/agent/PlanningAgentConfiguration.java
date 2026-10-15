package com.yangdoujiao.website.planningagent.agent;
import java.time.Clock;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.*;

@Configuration
public class PlanningAgentConfiguration {
    @Bean @ConditionalOnMissingBean(ModelInputSanitizer.class)
    ModelInputSanitizer planningInputSanitizer() { return new ModelInputSanitizer.VersionOnly(); }
    @Bean
    PlanningOrchestrator planningOrchestrator(ObjectProvider<PlanningModel> model,ToolDispatcher dispatcher,
            PlanValidator validator,ModelInputSanitizer sanitizer,ObjectMapper json,Clock clock) {
        return new PlanningOrchestrator(model.getIfAvailable(),dispatcher,validator,sanitizer,json,clock);
    }
}
