package com.yangdoujiao.website.search.v4.index;

import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.catalog.Country;
import com.yangdoujiao.website.catalog.Language;
import com.yangdoujiao.website.programme.Programme;
import com.yangdoujiao.website.programme.ProgrammeIntake;
import com.yangdoujiao.website.programme.ProgrammeIntakeRepository;
import com.yangdoujiao.website.programme.ProgrammeRepository;
import com.yangdoujiao.website.search.v4.document.ProgrammeSearchDocument;
import com.yangdoujiao.website.search.v4.document.UniversityProgrammeSearchDocument;
import com.yangdoujiao.website.university.UniversityRepository;

@Service
public class UniversitySearchProjectionLoader {

    private final UniversityRepository universities;
    private final ProgrammeRepository programmes;
    private final ProgrammeIntakeRepository intakes;

    public UniversitySearchProjectionLoader(UniversityRepository universities,
            ProgrammeRepository programmes, ProgrammeIntakeRepository intakes) {
        this.universities = universities;
        this.programmes = programmes;
        this.intakes = intakes;
    }

    @Transactional(readOnly = true)
    public Optional<UniversityProgrammeSearchDocument> loadPublishedUniversity(long universityId) {
        return universities.findByIdAndStatus(universityId, CategoryStatus.PUBLISHED).flatMap(university -> {
            List<Programme> published = programmes.findAllByUniversity_IdAndStatusOrderByIdAsc(
                    universityId, CategoryStatus.PUBLISHED);
            if (published.isEmpty()) {
                return Optional.empty();
            }

            Map<Long, List<ProgrammeIntake>> intakesByProgramme = intakes
                    .findAllByProgramme_IdInOrderByIntakeDateAsc(published.stream().map(Programme::getId).toList())
                    .stream()
                    .collect(Collectors.groupingBy(intake -> intake.getProgramme().getId()));
            List<ProgrammeSearchDocument> documents = published.stream()
                    .map(programme -> toDocument(programme, intakesByProgramme.getOrDefault(programme.getId(), List.of())))
                    .toList();
            Country country = university.getCountryReference();
            return Optional.of(new UniversityProgrammeSearchDocument(
                    university.getId(), university.getUniversityCode(), university.getSlug(),
                    university.getNameZh(), university.getNameEn(),
                    country == null ? null : country.getCode(),
                    country == null ? null : country.getNameZh(),
                    country == null ? null : country.getNameEn(),
                    university.getCityZh(), university.getCityEn(), university.isPopular(), documents));
        });
    }

    private ProgrammeSearchDocument toDocument(Programme programme, List<ProgrammeIntake> programmeIntakes) {
        List<String> languageCodes = programme.getLanguages().stream()
                .map(Language::getCode).distinct().sorted().toList();
        List<String> intakeMonths = programmeIntakes.stream()
                .map(ProgrammeIntake::getIntakeDate).filter(java.util.Objects::nonNull)
                .map(date -> YearMonth.from(date).toString()).distinct().sorted().toList();
        List<String> intakeDisplayTexts = programmeIntakes.stream()
                .sorted(Comparator.comparing(ProgrammeIntake::getIntakeDate,
                        Comparator.nullsLast(Comparator.naturalOrder())).thenComparing(ProgrammeIntake::getId))
                .map(ProgrammeIntake::getDisplayText).toList();

        return new ProgrammeSearchDocument(
                programme.getId(), programme.getProgrammeCode(), programme.getNameZh(), programme.getNameEn(),
                programme.getSubjectCategory().getCode(),
                programme.getStudyLevel() == null ? null : programme.getStudyLevel().getCode(),
                programme.getCourseMode() == null ? null : programme.getCourseMode().getCode(),
                languageCodes, programme.getDurationMonths(), intakeMonths,
                programme.getTuitionTotalRmbMin(), programme.getTuitionTotalRmbMax(),
                programme.getDurationDisplay(), intakeDisplayTexts, programme.getTuitionDisplay());
    }
}
