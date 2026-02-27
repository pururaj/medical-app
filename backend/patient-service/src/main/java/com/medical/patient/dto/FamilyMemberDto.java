package com.medical.patient.dto;

import com.medical.patient.entity.PatientFamilyMember;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilyMemberDto {

    private Long id;

    private Long primaryPatientId;

    // For response: full patient details of the member
    private PatientDto memberPatient;

    // For request: existing patient ID to link as family member
    private Long memberPatientId;

    @NotNull(message = "Relationship is required")
    private PatientFamilyMember.Relationship relationship;

    private LocalDateTime createdAt;
}
