package com.yangdoujiao.website.planningagent.agent;
import java.time.Clock;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.*;
import com.yangdoujiao.website.planningagent.config.PlanningAgentProperties;
import com.yangdoujiao.website.planningagent.security.*;

@Configuration
@EnableConfigurationProperties(PlanningAgentProperties.class)
public class PlanningAgentConfiguration {
    @Bean
    PlanningOrchestrator planningOrchestrator(ObjectProvider<PlanningModel> model,ToolDispatcher dispatcher,
            PlanValidator validator,ModelInputSanitizer sanitizer,ObjectMapper json,Clock clock,
            PlanningAgentProperties properties,PlanningLimits limits) {
        PlanningModel candidate=model.getIfAvailable();
        PlanningModel bounded=properties.available(candidate) ? context -> {
            if(json.writeValueAsString(context).getBytes(java.nio.charset.StandardCharsets.UTF_8).length>properties.maxInputTokens())
                throw new com.yangdoujiao.website.common.exception.ApiException(org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY,
                        "MODEL_INPUT_TOO_LARGE","Reduce the structured background or start a new session");
            return ((PlanningAgentProperties.ApprovedProvider)candidate).next(context,properties.maxInputTokens(),properties.maxOutputTokens());
        } : null;
        return new PlanningOrchestrator(bounded,dispatcher,validator,sanitizer,json,clock,
                input->limits.beforeCall(input.ownerId(),input.sessionId(),input.runId()));
    }
}
