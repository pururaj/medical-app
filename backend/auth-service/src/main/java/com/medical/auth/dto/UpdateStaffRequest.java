package com.medical.auth.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateStaffRequest {

    private String firstName;
    private String lastName;

    @Email(message = "Invalid email address")
    private String email;

    private String phoneNumber;
    private String department;
    private String shift;
    private String qualification;
    private String licenseNumber;
    private LocalDate joiningDate;

    // Optional: update password (null = no change)
    private String password;
}
