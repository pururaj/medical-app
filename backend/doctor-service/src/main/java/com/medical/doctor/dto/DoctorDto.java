package com.medical.doctor.dto;

import com.medical.doctor.entity.Doctor;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDto {

    private Long id;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+]?[0-9]{10,20}$", message = "Phone number should be valid")
    private String phoneNumber;

    private LocalDate dateOfBirth;

    private Doctor.Gender gender;

    @NotBlank(message = "Specialization is required")
    @Size(max = 100, message = "Specialization must not exceed 100 characters")
    private String specialization;

    @Size(max = 100, message = "Sub-specialization must not exceed 100 characters")
    private String subSpecialization;

    @NotBlank(message = "Qualification is required")
    @Size(max = 500, message = "Qualification must not exceed 500 characters")
    private String qualification;

    @NotNull(message = "Experience years is required")
    @Min(value = 0, message = "Experience years must be 0 or more")
    private Integer experienceYears;

    @NotBlank(message = "License number is required")
    @Size(max = 100, message = "License number must not exceed 100 characters")
    private String licenseNumber;

    @Size(max = 200, message = "Hospital name must not exceed 200 characters")
    private String hospitalName;

    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @NotNull(message = "Consultation fee is required")
    @DecimalMin(value = "0.0", message = "Consultation fee must be non-negative")
    private BigDecimal consultationFee;

    @Min(value = 1, message = "Consultation duration must be at least 1 minute")
    private Integer consultationDurationMinutes;

    private String bio;

    private String profileImageUrl;

    private BigDecimal averageRating;

    private Integer totalRatings;

    private Boolean available;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Computed field for convenience
    public String getFullName() {
        if (firstName != null && lastName != null) {
            return "Dr. " + firstName + " " + lastName;
        }
        return null;
    }
}
