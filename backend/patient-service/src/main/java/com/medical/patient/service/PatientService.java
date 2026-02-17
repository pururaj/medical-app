package com.medical.patient.service;

import com.medical.patient.dto.PatientDto;
import com.medical.patient.entity.Patient;
import com.medical.patient.mapper.PatientMapper;
import com.medical.patient.repository.PatientRepository;
import com.medical.shared.dto.PageResponse;
import com.medical.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Transactional
    public PatientDto createPatient(PatientDto patientDto) {
        log.info("Creating new patient with email: {}", patientDto.getEmail());

        if (patientRepository.existsByEmail(patientDto.getEmail())) {
            throw new IllegalArgumentException("Patient with email already exists: " + patientDto.getEmail());
        }

        Patient patient = patientMapper.toEntity(patientDto);
        patient.setActive(true);
        Patient savedPatient = patientRepository.save(patient);

        log.info("Patient created successfully with ID: {}", savedPatient.getId());
        return patientMapper.toDto(savedPatient);
    }

    @Transactional(readOnly = true)
    public PatientDto getPatientById(Long id) {
        log.info("Fetching patient with ID: {}", id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return patientMapper.toDto(patient);
    }

    @Transactional(readOnly = true)
    public PatientDto getPatientByEmail(String email) {
        log.info("Fetching patient with email: {}", email);
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "email", email));
        return patientMapper.toDto(patient);
    }

    @Transactional(readOnly = true)
    public PageResponse<PatientDto> getAllPatients(int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching all patients - page: {}, size: {}", page, size);

        Sort sort = sortDirection.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Patient> patientPage = patientRepository.findAll(pageable);

        return buildPageResponse(patientPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<PatientDto> getActivePatients(int page, int size) {
        log.info("Fetching active patients - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Patient> patientPage = patientRepository.findByActiveTrue(pageable);

        return buildPageResponse(patientPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<PatientDto> searchPatients(String keyword, int page, int size) {
        log.info("Searching patients with keyword: {}", keyword);

        Pageable pageable = PageRequest.of(page, size);
        Page<Patient> patientPage = patientRepository.searchPatients(keyword, pageable);

        return buildPageResponse(patientPage);
    }

    @Transactional
    public PatientDto updatePatient(Long id, PatientDto patientDto) {
        log.info("Updating patient with ID: {}", id);

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        patientMapper.updateEntityFromDto(patientDto, patient);
        Patient updatedPatient = patientRepository.save(patient);

        log.info("Patient updated successfully with ID: {}", id);
        return patientMapper.toDto(updatedPatient);
    }

    @Transactional
    public void deletePatient(Long id) {
        log.info("Soft deleting patient with ID: {}", id);

        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        patient.setActive(false);
        patientRepository.save(patient);

        log.info("Patient soft deleted successfully with ID: {}", id);
    }

    @Transactional
    public void hardDeletePatient(Long id) {
        log.info("Hard deleting patient with ID: {}", id);

        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient", "id", id);
        }

        patientRepository.deleteById(id);
        log.info("Patient hard deleted successfully with ID: {}", id);
    }

    private PageResponse<PatientDto> buildPageResponse(Page<Patient> patientPage) {
        return PageResponse.<PatientDto>builder()
                .content(patientPage.getContent().stream()
                        .map(patientMapper::toDto)
                        .toList())
                .pageNumber(patientPage.getNumber())
                .pageSize(patientPage.getSize())
                .totalElements(patientPage.getTotalElements())
                .totalPages(patientPage.getTotalPages())
                .last(patientPage.isLast())
                .first(patientPage.isFirst())
                .build();
    }
}
