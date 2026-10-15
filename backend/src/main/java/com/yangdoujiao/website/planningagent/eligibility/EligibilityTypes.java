package com.yangdoujiao.website.planningagent.eligibility;

import java.util.List;
import java.util.Map;

public final class EligibilityTypes {
    private EligibilityTypes() {}

    public enum Status { MET, NOT_MET, PROFILE_MISSING, EVIDENCE_MISSING }
    public record Profile(long version, Map<String, String> facts) {}
    public record Condition(String field, String operator, String expected, String scale, long evidenceId) {}
    public record RuleSet(long programmeId, long version, boolean complete, List<List<Condition>> alternatives) {}
    public record Finding(String field, Status status, long evidenceId) {}
    public record Assessment(boolean eligible, List<List<Finding>> alternatives) {}
}
