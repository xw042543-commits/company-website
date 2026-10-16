package com.yangdoujiao.website.planningagent.tools;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import com.yangdoujiao.website.planningagent.catalog.PlanningProgrammeLookupRepository;
import com.yangdoujiao.website.planningagent.catalog.PlanningProgrammeLookupRepository.Material;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PlanningProgrammeLookup {
    private static final int PAGE_SIZE = 20;
    private static final Set<String> LEVELS = Set.of("FOUNDATION", "BACHELOR", "MASTER", "DOCTOR");
    private final PlanningProgrammeLookupRepository repository;

    public PlanningProgrammeLookup(PlanningProgrammeLookupRepository repository) { this.repository = repository; }
    public record Source(String url, String type, String reference, Instant checkedAt) {}
    public record Item(long programmeId, String level, String nameZh, String nameEn, String university,
        String admissionsZh, String admissionsEn, String admissionsStatus, Source admissionsSource,
        BigDecimal tuitionMin, BigDecimal tuitionMax, String currency, String tuitionDisplay,
        String feesStatus, Source catalogueSource, boolean usableForAssessment) {}
    public record Result(int page, int size, boolean hasNext, List<Item> items) {}
    public Result search(String keyword, String level, int page) {
        if (page < 0 || page > 1000 || keyword != null && keyword.length() > 200
                || level != null && !level.isEmpty() && !LEVELS.contains(level)) {
            throw new IllegalArgumentException("Invalid programme lookup filters");
        }
        String query = keyword == null ? "" : keyword.strip();
        var words = query.isEmpty() ? List.<String>of() : List.of(query.split("(?U)\\s+"));
        var rows = repository.search(words, level == null || level.isEmpty() ? null : level,
                PAGE_SIZE + 1, (long) page * PAGE_SIZE);
        return new Result(page, PAGE_SIZE, rows.size() > PAGE_SIZE,
                rows.stream().limit(PAGE_SIZE).map(PlanningProgrammeLookup::item).toList());
    }

    private static Item item(Material row) {
        boolean admissions = present(row.admissionsZh()) || present(row.admissionsEn());
        String status = !admissions ? "MISSING" : "ai_generated".equalsIgnoreCase(row.admissionsType())
                ? "AI_GENERATED_UNVERIFIED" : "REVIEW_REQUIRED";
        boolean fees = row.tuitionMin() != null || row.tuitionMax() != null || present(row.tuitionDisplay());
        return new Item(row.id(), row.level(), row.nameZh(), row.nameEn(), row.university(),
                row.admissionsZh(), row.admissionsEn(), status,
                new Source(row.admissionsUrl(), row.admissionsType(), row.admissionsReference(), row.admissionsCheckedAt()),
                row.tuitionMin(), row.tuitionMax(), row.currency(), row.tuitionDisplay(),
                fees ? "REVIEW_REQUIRED" : "MISSING",
                new Source(row.sourceUrl(), row.sourceType(), row.sourceReference(), row.checkedAt()), false);
    }

    private static boolean present(String value) { return value != null && !value.isBlank(); }
}
