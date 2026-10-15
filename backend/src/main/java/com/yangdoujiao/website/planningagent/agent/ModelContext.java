package com.yangdoujiao.website.planningagent.agent;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.Profile;
public record ModelContext(List<String> redactedMessages, Profile confirmedProfile, List<ToolResult> results, Instant deadline) {
    public ModelContext {
        redactedMessages=List.copyOf(redactedMessages);
        confirmedProfile=new Profile(confirmedProfile.version(),Map.copyOf(confirmedProfile.facts()));
        results=results.stream().map(r->new ToolResult(r.name(),r.value().deepCopy())).toList();
    }
}
