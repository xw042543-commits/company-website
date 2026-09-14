package com.yangdoujiao.website.search;

import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.yangdoujiao.website.university.University;
import com.yangdoujiao.website.university.UniversityRepository;

@Service
public class UniversitySearchService {

    private static final Logger log = LoggerFactory.getLogger(UniversitySearchService.class);

    private final UniversityRepository universityRepository;
    private final UniversitySearchRepository universitySearchRepository;

    public UniversitySearchService(
            UniversityRepository universityRepository,
            UniversitySearchRepository universitySearchRepository
    ) {
        this.universityRepository = universityRepository;
        this.universitySearchRepository = universitySearchRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional(readOnly = true)
    public void rebuildIndex() {
        List<UniversitySearchDocument> documents = universityRepository.findAll()
                .stream()
                .map(this::toSearchDocument)
                .toList();

        universitySearchRepository.deleteAll();
        universitySearchRepository.saveAll(documents);
        log.info("Rebuilt university search index with {} documents", documents.size());
    }

    public List<UniversitySearchDocument> search(String query) {
        return universitySearchRepository
                .findByNameContainingOrCountryContaining(query.trim(), query.trim());
    }

    private UniversitySearchDocument toSearchDocument(University university) {
        return new UniversitySearchDocument(
                university.getId().toString(),
                university.getName(),
                university.getSlug(),
                university.getCountry(),
                university.isPopular()
        );
    }
}
