package com.yangdoujiao.website.planningagent.catalog;

import java.util.List;
import java.util.Set;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import com.yangdoujiao.website.media.MediaLookupRepository;

/** PostgreSQL is authoritative; the general search API's three previews are not a planning catalogue. */
@Repository
public class PlanningCatalogue {
    private static final Set<String> LEVELS = Set.of("FOUNDATION","BACHELOR","MASTER","DOCTOR");
    private static final String PUBLISHED_MY = "p.status='PUBLISHED' AND u.status='PUBLISHED' AND c.code='MY'";
    private final JdbcTemplate jdbc;
    private final MediaLookupRepository media;
    public PlanningCatalogue(JdbcTemplate jdbc) { this(jdbc,new MediaLookupRepository(new NamedParameterJdbcTemplate(jdbc))); }
    @Autowired
    public PlanningCatalogue(JdbcTemplate jdbc,MediaLookupRepository media) { this.jdbc = jdbc; this.media=media; }

    public record ProgrammeDisplay(long programmeId,String programmeNameZh,String programmeNameEn,
            String universityNameZh,String universityNameEn,String imageUrl) {
        public ProgrammeDisplay(long id,String zh,String en,String universityZh,String universityEn) { this(id,zh,en,universityZh,universityEn,null); }
    }

    public Optional<ProgrammeDisplay> display(long programmeId) {
        return jdbc.query("""
                SELECT p.id,p.name_zh,p.name_en,u.id AS university_id,u.name_zh AS university_zh,
                    COALESCE(NULLIF(BTRIM(u.name_en),''),u.name) AS university_en
                FROM programmes p JOIN universities u ON u.id=p.university_id
                JOIN countries c ON c.id=u.country_id WHERE p.id=? AND %s
                """.formatted(PUBLISHED_MY),(row,index)->new ProgrammeDisplay(row.getLong("id"),
                row.getString("name_zh"),row.getString("name_en"),row.getString("university_zh"),row.getString("university_en"),image(programmeId,row.getLong("university_id"))),
                programmeId).stream().findFirst();
    }
    private String image(long programmeId,long universityId) {
        String value=media.findProgrammeImageUrls(List.of(programmeId)).get(programmeId);
        if(value==null) value=media.findUniversityImageUrls(List.of(universityId)).get(universityId);
        // Existing published media only; never manufacture a campus URL or send active URL schemes.
        return value!=null && value.matches("https://[A-Za-z0-9.-]+(?::443)?(?:[/?#][^\\s\\\\<>]*)?") ? value : null;
    }

    /** Zero-based, twenty rows, stable id ordering; subject is an exact code or localized category name. */
    public List<Long> search(String level, String subject, String city, int page) {
        if (level == null || !LEVELS.contains(level) || page < 0
                || subject != null && subject.length() > 200 || city != null && city.length() > 200) {
            throw new IllegalArgumentException("Invalid planning catalogue filters");
        }
        String subjectFilter = subject == null || subject.isBlank() ? "" : subject.strip();
        String cityFilter = city == null || city.isBlank() ? "" : city.strip();
        return jdbc.queryForList("""
                SELECT p.id FROM programmes p
                JOIN universities u ON u.id=p.university_id
                JOIN countries c ON c.id=u.country_id
                JOIN study_levels l ON l.id=p.study_level_id
                JOIN subject_categories s ON s.id=p.subject_category_id
                WHERE %s AND l.code=?
                  AND (?='' OR lower(s.code)=lower(?) OR lower(s.name_en)=lower(?) OR s.name_zh=?)
                  AND (?='' OR lower(u.city_en)=lower(?) OR u.city_zh=?)
                ORDER BY p.id LIMIT 20 OFFSET ?
                """.formatted(PUBLISHED_MY),Long.class,level,subjectFilter,subjectFilter,subjectFilter,subjectFilter,
                cityFilter,cityFilter,cityFilter,(long)page*20);
    }

    public boolean isPublishedMalaysianProgramme(long programmeId) {
        if (programmeId <= 0) return false;
        return Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM programmes p
                JOIN universities u ON u.id=p.university_id JOIN countries c ON c.id=u.country_id
                WHERE p.id=? AND %s)
                """.formatted(PUBLISHED_MY),Boolean.class,programmeId));
    }
}
