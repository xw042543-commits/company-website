package com.yangdoujiao.website.planningagent.agent;
import java.util.List;
import java.util.Map;
import com.yangdoujiao.website.planningagent.session.PlanningDtos.RunInput;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.Profile;
/** Task 6 seam: replace fail-closed default only with reviewed, allowlisted sanitization. */
public interface ModelInputSanitizer {
    ModelContext sanitize(RunInput input,List<ToolResult> results);
    final class VersionOnly implements ModelInputSanitizer {
        public ModelContext sanitize(RunInput input,List<ToolResult> results) {
            return new ModelContext(List.of(),new Profile(input.profile().version(),Map.of()),results,input.deadline());
        }
    }
}
