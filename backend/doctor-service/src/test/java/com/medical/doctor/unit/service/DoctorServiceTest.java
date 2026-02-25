package com.medical.doctor.unit.service;

import com.medical.doctor.dto.DoctorDto;
import com.medical.doctor.entity.Doctor;
import com.medical.doctor.mapper.DoctorMapper;
import com.medical.doctor.repository.DoctorRepository;
import com.medical.doctor.service.DoctorService;
import com.medical.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private DoctorMapper doctorMapper;

    @InjectMocks
    private DoctorService doctorService;

    private Doctor sampleDoctor;
    private DoctorDto sampleDto;

    @BeforeEach
    void setUp() {
        sampleDoctor = Doctor.builder()
                .id(1L)
                .firstName("Aisha")
                .lastName("Sharma")
                .email("aisha.sharma@hospital.com")
                .phoneNumber("+911234567890")
                .specialization("Cardiology")
                .qualification("MBBS, MD (Cardiology)")
                .experienceYears(15)
                .licenseNumber("MCI-001")
                .consultationFee(new BigDecimal("800.00"))
                .consultationDurationMinutes(30)
                .available(true)
                .active(true)
                .build();

        sampleDto = DoctorDto.builder()
                .id(1L)
                .firstName("Aisha")
                .lastName("Sharma")
                .email("aisha.sharma@hospital.com")
                .phoneNumber("+911234567890")
                .specialization("Cardiology")
                .qualification("MBBS, MD (Cardiology)")
                .experienceYears(15)
                .licenseNumber("MCI-001")
                .consultationFee(new BigDecimal("800.00"))
                .consultationDurationMinutes(30)
                .available(true)
                .active(true)
                .build();
    }

    @Test
    void getDoctorById_WhenExists_ReturnsDto() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(sampleDoctor));
        when(doctorMapper.toDto(sampleDoctor)).thenReturn(sampleDto);

        DoctorDto result = doctorService.getDoctorById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getSpecialization()).isEqualTo("Cardiology");
    }

    @Test
    void getDoctorById_WhenNotExists_ThrowsResourceNotFoundException() {
        when(doctorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> doctorService.getDoctorById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createDoctor_WithUniqueEmail_ReturnsCreatedDto() {
        when(doctorRepository.existsByEmail(anyString())).thenReturn(false);
        when(doctorRepository.existsByLicenseNumber(anyString())).thenReturn(false);
        when(doctorMapper.toEntity(sampleDto)).thenReturn(sampleDoctor);
        when(doctorRepository.save(sampleDoctor)).thenReturn(sampleDoctor);
        when(doctorMapper.toDto(sampleDoctor)).thenReturn(sampleDto);

        DoctorDto result = doctorService.createDoctor(sampleDto);

        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("aisha.sharma@hospital.com");
    }

    @Test
    void createDoctor_WithDuplicateEmail_ThrowsIllegalArgumentException() {
        when(doctorRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> doctorService.createDoctor(sampleDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void toggleAvailability_FlipsAvailableFlag() {
        sampleDoctor.setAvailable(true);
        Doctor toggled = Doctor.builder()
                .id(1L).firstName("Aisha").lastName("Sharma")
                .email("aisha.sharma@hospital.com").phoneNumber("+911234567890")
                .specialization("Cardiology").qualification("MBBS, MD").experienceYears(15)
                .licenseNumber("MCI-001").consultationFee(BigDecimal.ZERO)
                .available(false).active(true).build();
        DoctorDto toggledDto = DoctorDto.builder().id(1L).available(false).build();

        when(doctorRepository.findById(1L)).thenReturn(Optional.of(sampleDoctor));
        when(doctorRepository.save(any(Doctor.class))).thenReturn(toggled);
        when(doctorMapper.toDto(toggled)).thenReturn(toggledDto);

        DoctorDto result = doctorService.toggleAvailability(1L);

        assertThat(result.getAvailable()).isFalse();
    }

    @Test
    void getAllDoctors_ReturnsPageResponse() {
        Page<Doctor> page = new PageImpl<>(List.of(sampleDoctor));
        when(doctorRepository.findByActiveTrue(any(Pageable.class))).thenReturn(page);
        when(doctorMapper.toDto(sampleDoctor)).thenReturn(sampleDto);

        var result = doctorService.getAllDoctors(0, 10);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    void deactivateDoctor_SetsActiveFalse() {
        when(doctorRepository.findById(1L)).thenReturn(Optional.of(sampleDoctor));
        when(doctorRepository.save(any(Doctor.class))).thenReturn(sampleDoctor);

        doctorService.deactivateDoctor(1L);

        verify(doctorRepository).save(argThat(d -> !d.getActive() && !d.getAvailable()));
    }
}
