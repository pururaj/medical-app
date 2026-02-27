package com.medical.patient.repository;

import com.medical.patient.entity.PatientFamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilyMemberRepository extends JpaRepository<PatientFamilyMember, Long> {

    List<PatientFamilyMember> findByPrimaryPatientId(Long primaryPatientId);

    Optional<PatientFamilyMember> findByPrimaryPatientIdAndMemberPatient_Id(Long primaryPatientId, Long memberPatientId);

    boolean existsByPrimaryPatientIdAndMemberPatient_Id(Long primaryPatientId, Long memberPatientId);

    void deleteByPrimaryPatientIdAndMemberPatient_Id(Long primaryPatientId, Long memberPatientId);
}
