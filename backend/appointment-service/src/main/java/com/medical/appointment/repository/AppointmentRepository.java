package com.medical.appointment.repository;

import com.medical.appointment.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Appointment> findByAppointmentDate(LocalDate appointmentDate, Pageable pageable);

    Page<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate, Pageable pageable);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatus(
            Long doctorId, LocalDate appointmentDate, Appointment.AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId " +
           "AND a.appointmentDate = :date " +
           "AND a.appointmentTime = :time " +
           "AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    List<Appointment> findConflictingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("time") LocalTime time);

    @Query("SELECT a FROM Appointment a WHERE a.patientId = :patientId " +
           "AND a.appointmentDate >= :fromDate " +
           "AND a.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "ORDER BY a.appointmentDate, a.appointmentTime")
    List<Appointment> findUpcomingAppointmentsByPatient(
            @Param("patientId") Long patientId,
            @Param("fromDate") LocalDate fromDate);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId " +
           "AND a.appointmentDate = :date " +
           "AND a.status IN ('SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS') " +
           "ORDER BY a.appointmentTime")
    List<Appointment> findTodaysAppointmentsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date);

    @Query("SELECT COALESCE(MAX(a.tokenNumber), 0) FROM Appointment a " +
           "WHERE a.doctorId = :doctorId AND a.appointmentDate = :date")
    Integer findMaxTokenNumberForDoctorAndDate(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status " +
           "AND a.appointmentDate = :date")
    Long countByStatusAndDate(
            @Param("status") Appointment.AppointmentStatus status,
            @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :startDate AND :endDate " +
           "ORDER BY a.appointmentDate, a.appointmentTime")
    List<Appointment> findAppointmentsBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
