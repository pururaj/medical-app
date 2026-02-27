package com.medical.patient.dto;

import com.medical.patient.entity.PatientFamilyMember;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request to add a family member.
 * Either link an existing patient (memberPatientId) OR
 * register a new patient inline (newMember).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddFamilyMemberRequest {

    // Option A: link an existing patient by ID
    private Long memberPatientId;

    // Option B: register a new patient as a family member
    @Valid
    private PatientDto newMember;

    @NotNull(message = "Relationship is required")
    private PatientFamilyMember.Relationship relationship;
}
