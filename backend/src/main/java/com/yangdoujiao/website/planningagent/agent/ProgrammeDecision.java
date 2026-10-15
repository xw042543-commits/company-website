package com.yangdoujiao.website.planningagent.agent;
import java.time.Instant;
import java.util.List;
import com.yangdoujiao.website.planningagent.eligibility.EligibilityTypes.*;
import com.yangdoujiao.website.planningagent.budget.BudgetTypes.BudgetResult;
/** All claims are reconstructed from current server records. No model free text is persisted. */
public record ProgrammeDecision(long programmeId, Assessment assessment, BudgetResult budget,
        List<Long> evidenceIds,String classification,String programmeNameZh,String programmeNameEn,
        String universityNameZh,String universityNameEn,Long ruleVersion,RuleSet ruleSnapshot,
        List<EvidenceSnapshot> evidenceSnapshot,String imageUrl) {
    public ProgrammeDecision(long programmeId,Assessment assessment,BudgetResult budget,List<Long> evidenceIds,String classification,
            String programmeNameZh,String programmeNameEn,String universityNameZh,String universityNameEn,Long ruleVersion,RuleSet ruleSnapshot,List<EvidenceSnapshot> evidenceSnapshot) {
        this(programmeId,assessment,budget,evidenceIds,classification,programmeNameZh,programmeNameEn,universityNameZh,universityNameEn,ruleVersion,ruleSnapshot,evidenceSnapshot,null);
    }
    public record EvidenceSnapshot(long id,long programmeId,String factType,String sourceUrl,
            String sourceType,String studentScope,String intake,Instant checkedAt,Instant expiresAt) {}
}
