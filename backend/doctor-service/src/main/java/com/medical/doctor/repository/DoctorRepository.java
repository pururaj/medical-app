package com.medical.doctor.repository;

import com.medical.doctor.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);

    Optional<Doctor> findByLicenseNumber(String licenseNumber);

    boolean existsByEmail(String email);

    boolean existsByLicenseNumber(String licenseNumber);

    Page<Doctor> findByActiveTrue(Pageable pageable);

    Page<Doctor> findBySpecializationIgnoreCaseAndActiveTrue(String specialization, Pageable pageable);

    Page<Doctor> findByCityIgnoreCaseAndActiveTrue(String city, Pageable pageable);

    Page<Doctor> findByAvailableTrueAndActiveTrue(Pageable pageable);

    @Query("SELECT d FROM Doctor d WHERE d.active = true AND " +
           "(:specialization IS NULL OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :specialization, '%'))) AND " +
           "(:city IS NULL OR LOWER(d.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:available IS NULL OR d.available = :available)")
    Page<Doctor> searchDoctors(
            @Param("specialization") String specialization,
            @Param("city") String city,
            @Param("available") Boolean available,
            Pageable pageable);

    @Query("SELECT DISTINCT d.specialization FROM Doctor d WHERE d.active = true ORDER BY d.specialization")
    List<String> findAllActiveSpecializations();

    @Query("SELECT DISTINCT d.city FROM Doctor d WHERE d.active = true AND d.city IS NOT NULL ORDER BY d.city")
    List<String> findAllActiveCities();
}
