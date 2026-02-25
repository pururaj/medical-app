package com.medical.appointment.repository;

import com.medical.appointment.entity.DoctorLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorLeaveRepository extends JpaRepository<DoctorLeave, Long> {

    @Query("SELECT dl FROM DoctorLeave dl WHERE dl.doctorId = :doctorId " +
           "AND dl.leaveDate = :date")
    List<DoctorLeave> findByDoctorIdAndDate(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date);

    @Query("SELECT dl FROM DoctorLeave dl WHERE dl.doctorId = :doctorId " +
           "AND :date BETWEEN dl.startDate AND dl.endDate")
    List<DoctorLeave> findByDoctorIdAndDateRange(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date);

    List<DoctorLeave> findByDoctorIdAndStartDateBetween(
            Long doctorId, LocalDate startDate, LocalDate endDate);
}
