package com.yangdoujiao.website.planningagent.eligibility;

import java.util.Map;
import java.util.Set;

/** Equivalent academic labels only. Never converts numbers or aliases language examinations. */
public final class AcademicScoreScale {
    private static final Map<String,String> ALIASES = Map.of("PERCENT","100","GPA4","4","GPA5","5","GPA10","10");
    private static final Set<String> SCALES = Set.of("100","4","5","10");
    public static final Set<String> FIELDS = Set.of("grade.scale","math.scale","science.scale");
    private AcademicScoreScale() {}
    public static String canonical(String field,String value) {
        return value != null && FIELDS.contains(field) ? ALIASES.getOrDefault(value,value) : value;
    }
    public static boolean supported(String canonical) { return canonical != null && SCALES.contains(canonical); }
}
