package com.medical.appointment.repository;

import com.medical.appointment.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Long> {

    List<DoctorSchedule> findByDoctorIdAndActive(Long doctorId, Boolean active);

    Optional<DoctorSchedule> findByDoctorIdAndDayOfWeekAndActive(
            Long doctorId, DayOfWeek dayOfWeek, Boolean active);

    @Query("SELECT ds FROM DoctorSchedule ds WHERE ds.doctorId = :doctorId " +
           "AND ds.dayOfWeek = :dayOfWeek AND ds.active = true " +
           "AND (ds.effectiveFrom IS NULL OR ds.effectiveFrom <= :date) " +
           "AND (ds.effectiveUntil IS NULL OR ds.effectiveUntil >= :date)")
    Optional<DoctorSchedule> findActiveScheduleForDoctorAndDay(
            @Param("doctorId") Long doctorId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("date") LocalDate date);

    List<DoctorSchedule> findByDoctorId(Long doctorId);
}
