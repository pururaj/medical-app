package com.medical.doctor.service;

import com.medical.doctor.dto.DoctorDto;
import com.medical.doctor.entity.Doctor;
import com.medical.doctor.mapper.DoctorMapper;
import com.medical.doctor.repository.DoctorRepository;
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

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorMapper doctorMapper;

    @Transactional
    public DoctorDto createDoctor(DoctorDto dto) {
        log.info("Creating doctor profile for: {} {}", dto.getFirstName(), dto.getLastName());

        if (doctorRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Doctor with email " + dto.getEmail() + " already exists");
        }
        if (doctorRepository.existsByLicenseNumber(dto.getLicenseNumber())) {
            throw new IllegalArgumentException("Doctor with license number " + dto.getLicenseNumber() + " already exists");
        }

        Doctor doctor = doctorMapper.toEntity(dto);
        Doctor saved = doctorRepository.save(doctor);
        log.info("Doctor created with ID: {}", saved.getId());
        return doctorMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public DoctorDto getDoctorById(Long id) {
        log.info("Fetching doctor with ID: {}", id);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        return doctorMapper.toDto(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorDto getDoctorByEmail(String email) {
        log.info("Fetching doctor with email: {}", email);
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "email", email));
        return doctorMapper.toDto(doctor);
    }

    @Transactional(readOnly = true)
    public PageResponse<DoctorDto> getAllDoctors(int page, int size) {
        log.info("Fetching all active doctors - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName", "lastName").ascending());
        Page<Doctor> doctorPage = doctorRepository.findByActiveTrue(pageable);
        return buildPageResponse(doctorPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<DoctorDto> searchDoctors(String specialization, String city, Boolean available, int page, int size) {
        log.info("Searching doctors - specialization: {}, city: {}, available: {}", specialization, city, available);
        Pageable pageable = PageRequest.of(page, size, Sort.by("averageRating").descending());
        Page<Doctor> doctorPage = doctorRepository.searchDoctors(specialization, city, available, pageable);
        return buildPageResponse(doctorPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<DoctorDto> getDoctorsBySpecialization(String specialization, int page, int size) {
        log.info("Fetching doctors by specialization: {}", specialization);
        Pageable pageable = PageRequest.of(page, size, Sort.by("averageRating").descending());
        Page<Doctor> doctorPage = doctorRepository.findBySpecializationIgnoreCaseAndActiveTrue(specialization, pageable);
        return buildPageResponse(doctorPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<DoctorDto> getAvailableDoctors(int page, int size) {
        log.info("Fetching available doctors");
        Pageable pageable = PageRequest.of(page, size, Sort.by("averageRating").descending());
        Page<Doctor> doctorPage = doctorRepository.findByAvailableTrueAndActiveTrue(pageable);
        return buildPageResponse(doctorPage);
    }

    @Transactional(readOnly = true)
    public List<String> getSpecializations() {
        return doctorRepository.findAllActiveSpecializations();
    }

    @Transactional(readOnly = true)
    public List<String> getCities() {
        return doctorRepository.findAllActiveCities();
    }

    @Transactional
    public DoctorDto updateDoctor(Long id, DoctorDto dto) {
        log.info("Updating doctor with ID: {}", id);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));

        // Check email uniqueness if changed
        if (!doctor.getEmail().equals(dto.getEmail()) && doctorRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email " + dto.getEmail() + " is already in use");
        }

        doctorMapper.updateEntityFromDto(dto, doctor);
        Doctor updated = doctorRepository.save(doctor);
        log.info("Doctor updated: {}", id);
        return doctorMapper.toDto(updated);
    }

    @Transactional
    public DoctorDto toggleAvailability(Long id) {
        log.info("Toggling availability for doctor: {}", id);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        doctor.setAvailable(!doctor.getAvailable());
        Doctor updated = doctorRepository.save(doctor);
        return doctorMapper.toDto(updated);
    }

    @Transactional
    public void deactivateDoctor(Long id) {
        log.info("Deactivating doctor with ID: {}", id);
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        doctor.setActive(false);
        doctor.setAvailable(false);
        doctorRepository.save(doctor);
        log.info("Doctor deactivated: {}", id);
    }

    private PageResponse<DoctorDto> buildPageResponse(Page<Doctor> doctorPage) {
        return PageResponse.<DoctorDto>builder()
                .content(doctorPage.getContent().stream()
                        .map(doctorMapper::toDto)
                        .toList())
                .pageNumber(doctorPage.getNumber())
                .pageSize(doctorPage.getSize())
                .totalElements(doctorPage.getTotalElements())
                .totalPages(doctorPage.getTotalPages())
                .last(doctorPage.isLast())
                .first(doctorPage.isFirst())
                .build();
    }
}
