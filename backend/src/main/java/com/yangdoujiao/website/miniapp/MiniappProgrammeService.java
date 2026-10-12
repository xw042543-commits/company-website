package com.yangdoujiao.website.miniapp;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yangdoujiao.website.catalog.CategoryStatus;
import com.yangdoujiao.website.common.exception.ResourceNotFoundException;
import com.yangdoujiao.website.media.MediaLookupRepository;
import com.yangdoujiao.website.programme.Programme;
import com.yangdoujiao.website.programme.ProgrammeDetailSectionRepository;
import com.yangdoujiao.website.programme.ProgrammeIntakeRepository;
import com.yangdoujiao.website.programme.ProgrammeRepository;
import com.yangdoujiao.website.university.University;
import com.yangdoujiao.website.university.UniversityRepository;

@Service
public class MiniappProgrammeService {
    private final UniversityRepository universities;
    private final ProgrammeRepository programmes;
    private final ProgrammeIntakeRepository intakes;
    private final ProgrammeDetailSectionRepository sections;
    private final MediaLookupRepository media;

    public MiniappProgrammeService(UniversityRepository universities, ProgrammeRepository programmes,
            ProgrammeIntakeRepository intakes, ProgrammeDetailSectionRepository sections,
            MediaLookupRepository media) {
        this.universities = universities;
        this.programmes = programmes;
        this.intakes = intakes;
        this.sections = sections;
        this.media = media;
    }

    @Transactional(readOnly = true)
    public MiniappProgrammeDetailResponse getPublished(String universitySlug, String identifier) {
        University university = universities.findBySlugAndStatus(universitySlug, CategoryStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("University not found"));
        Programme programme = findProgramme(university.getId(), identifier)
                .orElseThrow(() -> new ResourceNotFoundException("Programme not found"));
        String imageUrl = media.findProgrammeImageUrls(List.of(programme.getId())).get(programme.getId());
        if (imageUrl == null) {
            imageUrl = media.findUniversityImageUrls(List.of(university.getId())).get(university.getId());
        }
        return MiniappProgrammeDetailResponse.from(programme, university,
                intakes.findByProgrammeIdOrderByIntakeDateAsc(programme.getId()),
                sections.findAllByProgramme_IdAndStatusOrderBySortOrderAscIdAsc(
                        programme.getId(), CategoryStatus.PUBLISHED), imageUrl);
    }

    private Optional<Programme> findProgramme(Long universityId, String identifier) {
        if (identifier != null && identifier.matches("[1-9]\\d*")) {
            try {
                return programmes.findPublishedDetailedByIdAndUniversityId(Long.valueOf(identifier), universityId);
            } catch (NumberFormatException ignored) {
                return Optional.empty();
            }
        }
        return programmes.findPublishedDetailedBySlugAndUniversityId(identifier, universityId);
    }
}
