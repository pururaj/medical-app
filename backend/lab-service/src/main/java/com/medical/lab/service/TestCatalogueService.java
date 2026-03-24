package com.medical.lab.service;

import com.medical.lab.dto.*;
import com.medical.lab.entity.TestCatalogue;
import com.medical.lab.repository.TestCatalogueRepository;
import com.medical.shared.dto.PageResponse;
import com.medical.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TestCatalogueService {

    private final TestCatalogueRepository catalogueRepo;

    @Transactional(readOnly = true)
    public PageResponse<TestCatalogueDto> getCatalogues(String keyword, int page, int size) {
        Specification<TestCatalogue> spec = Specification.where(null);
        if (keyword != null && !keyword.isBlank()) {
            String like = "%" + keyword.toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("testName")), like),
                    cb.like(cb.lower(root.get("testCode")), like),
                    cb.like(cb.lower(root.get("category")), like)
            ));
        }
        spec = spec.and((root, q, cb) -> cb.isTrue(root.get("active")));

        Page<TestCatalogue> result = catalogueRepo.findAll(spec,
                PageRequest.of(page, size, Sort.by("testName").ascending()));

        List<TestCatalogueDto> content = result.getContent().stream().map(this::toDto).toList();
        return PageResponse.<TestCatalogueDto>builder()
                .content(content)
                .pageNumber(result.getNumber())
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public TestCatalogueDto getCatalogueById(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public TestCatalogueDto createCatalogue(CreateCatalogueRequest req) {
        TestCatalogue catalogue = TestCatalogue.builder()
                .testCode(req.getTestCode().toUpperCase())
                .testName(req.getTestName())
                .category(req.getCategory())
                .description(req.getDescription())
                .sampleType(req.getSampleType())
                .price(req.getPrice())
                .turnaroundHours(req.getTurnaroundHours())
                .referenceRange(req.getReferenceRange())
                .unit(req.getUnit())
                .build();
        return toDto(catalogueRepo.save(catalogue));
    }

    @Transactional
    public TestCatalogueDto updateCatalogue(Long id, UpdateCatalogueRequest req) {
        TestCatalogue catalogue = findById(id);
        if (req.getTestName() != null) catalogue.setTestName(req.getTestName());
        if (req.getCategory() != null) catalogue.setCategory(req.getCategory());
        if (req.getDescription() != null) catalogue.setDescription(req.getDescription());
        if (req.getSampleType() != null) catalogue.setSampleType(req.getSampleType());
        if (req.getPrice() != null) catalogue.setPrice(req.getPrice());
        if (req.getTurnaroundHours() != null) catalogue.setTurnaroundHours(req.getTurnaroundHours());
        if (req.getReferenceRange() != null) catalogue.setReferenceRange(req.getReferenceRange());
        if (req.getUnit() != null) catalogue.setUnit(req.getUnit());
        if (req.getActive() != null) catalogue.setActive(req.getActive());
        return toDto(catalogueRepo.save(catalogue));
    }

    @Transactional
    public void deleteCatalogue(Long id) {
        TestCatalogue catalogue = findById(id);
        catalogue.setActive(false);
        catalogueRepo.save(catalogue);
    }

    public TestCatalogue findById(Long id) {
        return catalogueRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test catalogue not found: " + id));
    }

    private TestCatalogueDto toDto(TestCatalogue c) {
        return TestCatalogueDto.builder()
                .id(c.getId())
                .testCode(c.getTestCode())
                .testName(c.getTestName())
                .category(c.getCategory())
                .description(c.getDescription())
                .sampleType(c.getSampleType())
                .price(c.getPrice())
                .turnaroundHours(c.getTurnaroundHours())
                .referenceRange(c.getReferenceRange())
                .unit(c.getUnit())
                .active(c.getActive())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
