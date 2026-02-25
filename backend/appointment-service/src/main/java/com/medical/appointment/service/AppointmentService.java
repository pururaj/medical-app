package com.medical.appointment.service;

import com.medical.appointment.dto.AppointmentBookingRequest;
import com.medical.appointment.dto.AppointmentDto;
import com.medical.appointment.dto.TimeSlotDto;
import com.medical.appointment.entity.Appointment;
import com.medical.appointment.entity.DoctorLeave;
import com.medical.appointment.entity.DoctorSchedule;
import com.medical.appointment.mapper.AppointmentMapper;
import com.medical.appointment.repository.AppointmentRepository;
import com.medical.appointment.repository.DoctorLeaveRepository;
import com.medical.appointment.repository.DoctorScheduleRepository;
import com.medical.shared.dto.PageResponse;
import com.medical.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorLeaveRepository leaveRepository;
    private final AppointmentMapper appointmentMapper;

    @Transactional
    public AppointmentDto bookAppointment(AppointmentBookingRequest request) {
        log.info("Booking appointment for patient {} with doctor {} on {} at {}",
                request.getPatientId(), request.getDoctorId(),
                request.getAppointmentDate(), request.getAppointmentTime());

        // Validate appointment time is available
        validateAppointmentSlot(request.getDoctorId(), request.getAppointmentDate(), request.getAppointmentTime());

        // Check if doctor is on leave
        List<DoctorLeave> leaves = leaveRepository.findByDoctorIdAndDateRange(
                request.getDoctorId(), request.getAppointmentDate());
        if (!leaves.isEmpty()) {
            throw new IllegalStateException("Doctor is on leave on the selected date");
        }

        // Generate token number
        Integer tokenNumber = appointmentRepository.findMaxTokenNumberForDoctorAndDate(
                request.getDoctorId(), request.getAppointmentDate()) + 1;

        // Create appointment
        Appointment appointment = Appointment.builder()
                .patientId(request.getPatientId())
                .patientName(request.getPatientName())
                .patientPhone(request.getPatientPhone())
                .patientEmail(request.getPatientEmail())
                .doctorId(request.getDoctorId())
                .doctorName(request.getDoctorName())
                .specialization(request.getSpecialization())
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .type(request.getType())
                .status(Appointment.AppointmentStatus.SCHEDULED)
                .reasonForVisit(request.getReasonForVisit())
                .symptoms(request.getSymptoms())
                .notes(request.getNotes())
                .tokenNumber(tokenNumber)
                .durationMinutes(30) // Default duration
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);
        log.info("Appointment booked successfully with ID: {} and token number: {}",
                savedAppointment.getId(), tokenNumber);

        return appointmentMapper.toDto(savedAppointment);
    }

    private void validateAppointmentSlot(Long doctorId, LocalDate date, LocalTime time) {
        // Check if slot is within doctor's working hours
        DoctorSchedule schedule = scheduleRepository
                .findActiveScheduleForDoctorAndDay(doctorId, date.getDayOfWeek(), date)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Doctor is not available on " + date.getDayOfWeek()));

        if (time.isBefore(schedule.getStartTime()) || time.isAfter(schedule.getEndTime())) {
            throw new IllegalArgumentException("Selected time is outside doctor's working hours");
        }

        // Check if time is during break
        if (schedule.getBreakStartTime() != null && schedule.getBreakEndTime() != null) {
            if (!time.isBefore(schedule.getBreakStartTime()) &&
                time.isBefore(schedule.getBreakEndTime())) {
                throw new IllegalArgumentException("Selected time is during doctor's break");
            }
        }

        // Check if slot is already booked
        List<Appointment> conflicting = appointmentRepository.findConflictingAppointments(
                doctorId, date, time);
        if (!conflicting.isEmpty()) {
            throw new IllegalArgumentException("Selected time slot is already booked");
        }
    }

    public List<TimeSlotDto> getAvailableTimeSlots(Long doctorId, LocalDate date) {
        log.info("Fetching available time slots for doctor {} on {}", doctorId, date);

        // Check if doctor is on leave
        List<DoctorLeave> leaves = leaveRepository.findByDoctorIdAndDateRange(doctorId, date);
        if (!leaves.isEmpty()) {
            log.info("Doctor is on leave on {}", date);
            return new ArrayList<>();
        }

        // Get doctor's schedule for the day
        DoctorSchedule schedule = scheduleRepository
                .findActiveScheduleForDoctorAndDay(doctorId, date.getDayOfWeek(), date)
                .orElse(null);

        if (schedule == null) {
            log.info("No schedule found for doctor {} on {}", doctorId, date.getDayOfWeek());
            return new ArrayList<>();
        }

        // Get all booked appointments for the day
        List<Appointment> bookedAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDateAndStatus(
                        doctorId, date, Appointment.AppointmentStatus.SCHEDULED);

        // Generate time slots
        List<TimeSlotDto> slots = new ArrayList<>();
        LocalTime currentSlot = schedule.getStartTime();

        while (currentSlot.isBefore(schedule.getEndTime())) {
            // Skip if during break
            if (schedule.getBreakStartTime() != null && schedule.getBreakEndTime() != null) {
                if (!currentSlot.isBefore(schedule.getBreakStartTime()) &&
                    currentSlot.isBefore(schedule.getBreakEndTime())) {
                    currentSlot = currentSlot.plusMinutes(schedule.getSlotDurationMinutes());
                    continue;
                }
            }

            // Check if slot is booked
            LocalTime finalCurrentSlot = currentSlot;
            boolean isBooked = bookedAppointments.stream()
                    .anyMatch(apt -> apt.getAppointmentTime().equals(finalCurrentSlot));

            TimeSlotDto slot = TimeSlotDto.builder()
                    .date(date)
                    .startTime(currentSlot)
                    .endTime(currentSlot.plusMinutes(schedule.getSlotDurationMinutes()))
                    .available(!isBooked)
                    .availableSlots(isBooked ? 0 : 1)
                    .bookedSlots(isBooked ? 1 : 0)
                    .build();

            slots.add(slot);
            currentSlot = currentSlot.plusMinutes(schedule.getSlotDurationMinutes());
        }

        log.info("Generated {} time slots for doctor {} on {}", slots.size(), doctorId, date);
        return slots;
    }

    @Transactional(readOnly = true)
    public AppointmentDto getAppointmentById(Long id) {
        log.info("Fetching appointment with ID: {}", id);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return appointmentMapper.toDto(appointment);
    }

    @Transactional(readOnly = true)
    public PageResponse<AppointmentDto> getAllAppointments(int page, int size) {
        log.info("Fetching all appointments - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate", "appointmentTime").descending());
        Page<Appointment> appointmentPage = appointmentRepository.findAll(pageable);
        return buildPageResponse(appointmentPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<AppointmentDto> getAppointmentsByPatient(Long patientId, int page, int size) {
        log.info("Fetching appointments for patient {} - page: {}, size: {}", patientId, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate", "appointmentTime").descending());
        Page<Appointment> appointmentPage = appointmentRepository.findByPatientId(patientId, pageable);
        return buildPageResponse(appointmentPage);
    }

    @Transactional(readOnly = true)
    public PageResponse<AppointmentDto> getAppointmentsByDoctor(Long doctorId, int page, int size) {
        log.info("Fetching appointments for doctor {} - page: {}, size: {}", doctorId, page, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("appointmentDate", "appointmentTime").descending());
        Page<Appointment> appointmentPage = appointmentRepository.findByDoctorId(doctorId, pageable);
        return buildPageResponse(appointmentPage);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDto> getTodaysAppointmentsForDoctor(Long doctorId) {
        log.info("Fetching today's appointments for doctor {}", doctorId);
        List<Appointment> appointments = appointmentRepository
                .findTodaysAppointmentsForDoctor(doctorId, LocalDate.now());
        return appointments.stream()
                .map(appointmentMapper::toDto)
                .toList();
    }

    @Transactional
    public AppointmentDto checkIn(Long appointmentId) {
        log.info("Checking in appointment {}", appointmentId);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        appointment.setStatus(Appointment.AppointmentStatus.CHECKED_IN);
        appointment.setCheckedInAt(LocalDateTime.now());

        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updated);
    }

    @Transactional
    public AppointmentDto startConsultation(Long appointmentId) {
        log.info("Starting consultation for appointment {}", appointmentId);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        appointment.setStatus(Appointment.AppointmentStatus.IN_PROGRESS);
        appointment.setConsultationStartedAt(LocalDateTime.now());

        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updated);
    }

    @Transactional
    public AppointmentDto completeAppointment(Long appointmentId) {
        log.info("Completing appointment {}", appointmentId);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        appointment.setStatus(Appointment.AppointmentStatus.COMPLETED);
        appointment.setConsultationEndedAt(LocalDateTime.now());

        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updated);
    }

    @Transactional
    public AppointmentDto cancelAppointment(Long appointmentId, String reason, String cancelledBy) {
        log.info("Cancelling appointment {} by {}", appointmentId, cancelledBy);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointment.setCancelledBy(cancelledBy);
        appointment.setCancelledAt(LocalDateTime.now());

        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updated);
    }

    @Transactional
    public AppointmentDto rescheduleAppointment(Long appointmentId, LocalDate newDate, LocalTime newTime) {
        log.info("Rescheduling appointment {} to {} at {}", appointmentId, newDate, newTime);
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        // Validate new slot
        validateAppointmentSlot(appointment.getDoctorId(), newDate, newTime);

        appointment.setAppointmentDate(newDate);
        appointment.setAppointmentTime(newTime);
        appointment.setStatus(Appointment.AppointmentStatus.RESCHEDULED);

        Appointment updated = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updated);
    }

    private PageResponse<AppointmentDto> buildPageResponse(Page<Appointment> appointmentPage) {
        return PageResponse.<AppointmentDto>builder()
                .content(appointmentPage.getContent().stream()
                        .map(appointmentMapper::toDto)
                        .toList())
                .pageNumber(appointmentPage.getNumber())
                .pageSize(appointmentPage.getSize())
                .totalElements(appointmentPage.getTotalElements())
                .totalPages(appointmentPage.getTotalPages())
                .last(appointmentPage.isLast())
                .first(appointmentPage.isFirst())
                .build();
    }
}
