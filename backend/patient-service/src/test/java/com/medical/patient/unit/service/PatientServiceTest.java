package com.medical.patient.unit.service;

import com.medical.patient.dto.PatientDto;
import com.medical.patient.entity.Patient;
import com.medical.patient.mapper.PatientMapper;
import com.medical.patient.repository.PatientRepository;
import com.medical.patient.service.PatientService;
import com.medical.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Patient Service Unit Tests")
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private PatientMapper patientMapper;

    @InjectMocks
    private PatientService patientService;

    private Patient patient;
    private PatientDto patientDto;

    @BeforeEach
    void setUp() {
        patient = Patient.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phoneNumber("+1234567890")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender(Patient.Gender.MALE)
                .active(true)
                .build();

        patientDto = PatientDto.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phoneNumber("+1234567890")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender(Patient.Gender.MALE)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should create patient successfully")
    void shouldCreatePatientSuccessfully() {
        // Given
        when(patientRepository.existsByEmail(anyString())).thenReturn(false);
        when(patientMapper.toEntity(any(PatientDto.class))).thenReturn(patient);
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);
        when(patientMapper.toDto(any(Patient.class))).thenReturn(patientDto);

        // When
        PatientDto result = patientService.createPatient(patientDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("john.doe@example.com");
        verify(patientRepository, times(1)).existsByEmail(anyString());
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void shouldThrowExceptionWhenEmailExists() {
        // Given
        when(patientRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> patientService.createPatient(patientDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Patient with email already exists");

        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    @DisplayName("Should get patient by ID successfully")
    void shouldGetPatientByIdSuccessfully() {
        // Given
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(patientMapper.toDto(any(Patient.class))).thenReturn(patientDto);

        // When
        PatientDto result = patientService.getPatientById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(patientRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when patient not found by ID")
    void shouldThrowExceptionWhenPatientNotFoundById() {
        // Given
        when(patientRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> patientService.getPatientById(1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Patient not found");

        verify(patientRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should soft delete patient successfully")
    void shouldSoftDeletePatientSuccessfully() {
        // Given
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patient));
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        // When
        patientService.deletePatient(1L);

        // Then
        assertThat(patient.getActive()).isFalse();
        verify(patientRepository, times(1)).save(any(Patient.class));
    }
}
