package com.yangdoujiao.website.planningagent.security;

import java.util.*;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import com.yangdoujiao.website.common.exception.ApiException;
import com.yangdoujiao.website.planningagent.agent.*;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.Profile;
import com.yangdoujiao.website.planningagent.eligibility.AcademicScoreScale;
import com.yangdoujiao.website.planningagent.session.PlanningDtos.RunInput;

/** Bounded grammar, not a claim that arbitrary personal prose can be anonymized. */
@Component
public class PlanningPrivacyFilter implements ModelInputSanitizer {
    private static final Pattern CONTACT=Pattern.compile("(?i)[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}|(?<![\\p{L}\\d])(?:\\+?\\d[\\d ()-]{8,}\\d)(?![\\p{L}\\d])");
    private static final Set<String> SAFE_TEXT=Set.of("plan","hello","help","generate","recommend","compare","budget","intake",
            "master","bachelor","foundation","doctor","ielts","toefl","yes","no","请生成方案","生成方案","规划","你好","预算","入学时间","继续","确认");
    private static final Set<String> NUMERIC=Set.of("grade","languageTotal","languageListening","languageReading","languageWriting",
            "languageSpeaking","math","science","budget","transferCredits");
    private static final Map<String,Set<String>> ENUMS=Map.ofEntries(
            Map.entry("targetLevel",Set.of("FOUNDATION","BACHELOR","MASTER","DOCTOR")),
            Map.entry("languageTest",Set.of("IELTS","TOEFL","PTE","MUET","NONE")),
            Map.entry("budgetCurrency",Set.of("MYR","CNY","USD","GBP","EUR","SGD")),
            Map.entry("budgetPeriod",Set.of("YEAR","SEMESTER","TOTAL","ANNUAL","PER_YEAR","FULL_PROGRAMME")),
            Map.entry("budgetIncludesLiving",Set.of("true","false")),
            Map.entry("researchPlanReady",Set.of("true","false")),Map.entry("crossMajor",Set.of("true","false")),
            Map.entry("degreeAwarded",Set.of("true","false")),
            Map.entry("education",Set.of("HIGH_SCHOOL","BACHELOR","MASTER","DOCTOR","DIPLOMA","FOUNDATION")),
            Map.entry("qualification",Set.of("HIGH_SCHOOL","BACHELOR","MASTER","DOCTOR","DIPLOMA","FOUNDATION","STPM","A_LEVEL","UEC","IB")),
            Map.entry("graduationStatus",Set.of("GRADUATED","CURRENT","EXPECTED")),
            Map.entry("studyMode",Set.of("FULL_TIME","PART_TIME","COURSEWORK","RESEARCH","MIXED")),
            Map.entry("curriculum",Set.of("A_LEVEL","IB","STPM","UEC","GAOKAO","AP")));
    @Override public ModelContext sanitize(RunInput input,List<ToolResult> results) {
        Map<String,String> facts=new LinkedHashMap<>();
        input.profile().facts().forEach((field,value)-> {
            if(NUMERIC.contains(field)) {
                if(!value.matches("\\d{1,9}(\\.\\d{1,4})?")) throw structured();
                facts.put(field,value);
            } else if(ENUMS.containsKey(field)) {
                if(!ENUMS.get(field).contains(value)) throw structured();
                facts.put(field,value);
            } else if(field.endsWith(".scale")) {
                String scale = AcademicScoreScale.canonical(field,value);
                if (AcademicScoreScale.FIELDS.contains(field)) {
                    if (!AcademicScoreScale.supported(scale)) throw structured();
                } else if(!Set.of("PERCENT","GPA4","GPA5","GPA10","IELTS","TOEFL","PTE","MUET","100","4","5","10","9","120").contains(value)) throw structured();
                facts.put(field,scale);
            } else if(field.equals("intake")) {
                if(!value.matches("20\\d{2}(?:[-/]\\d{1,2})?")) throw structured();
                facts.put(field,value);
            }
            // Institution, names and unbounded educational/research descriptions stay server-side.
        });
        List<String> messages=new ArrayList<>();
        // Assistant history is structured server output, and is not needed as model conversation input.
        String safe=CONTACT.matcher(input.text()).replaceAll(" ").strip().toLowerCase(Locale.ROOT);
        safe=safe.replaceAll("[,.!?，。！？]"," ").replaceAll("\\s+"," ").strip();
        if(!safe.isBlank()) {
            for(String word:safe.split(" ")) if(!SAFE_TEXT.contains(word)) throw structured();
            messages.add(safe);
        }
        return new ModelContext(messages,new Profile(input.profile().version(),Map.copyOf(facts)),results,input.deadline());
    }
    private static ApiException structured() {
        return new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,"STRUCTURED_INPUT_REQUIRED",
                "Use the structured background form for education, scores, intake and budget; personal narrative cannot be sent to the model.");
    }
}
