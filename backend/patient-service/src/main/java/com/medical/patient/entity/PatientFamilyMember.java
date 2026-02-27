package com.medical.patient.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_family_members")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientFamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "primary_patient_id", nullable = false)
    private Long primaryPatientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_patient_id", nullable = false)
    private Patient memberPatient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Relationship relationship;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Relationship {
        SPOUSE, CHILD, PARENT, SIBLING, GRANDPARENT, GRANDCHILD, OTHER
    }
}
