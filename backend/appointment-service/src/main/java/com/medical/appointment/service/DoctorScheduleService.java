package com.medical.appointment.service;

import com.medical.appointment.dto.DoctorScheduleDto;
import com.medical.appointment.entity.DoctorSchedule;
import com.medical.appointment.mapper.DoctorScheduleMapper;
import com.medical.appointment.repository.DoctorScheduleRepository;
import com.medical.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorScheduleService {

    private final DoctorScheduleRepository scheduleRepository;
    private final DoctorScheduleMapper scheduleMapper;

    @Transactional
    public DoctorScheduleDto createSchedule(DoctorScheduleDto scheduleDto) {
        log.info("Creating schedule for doctor {} on {}", scheduleDto.getDoctorId(), scheduleDto.getDayOfWeek());

        DoctorSchedule schedule = scheduleMapper.toEntity(scheduleDto);
        schedule.setActive(true);

        DoctorSchedule saved = scheduleRepository.save(schedule);
        log.info("Schedule created with ID: {}", saved.getId());

        return scheduleMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<DoctorScheduleDto> getSchedulesByDoctor(Long doctorId) {
        log.info("Fetching schedules for doctor {}", doctorId);
        List<DoctorSchedule> schedules = scheduleRepository.findByDoctorId(doctorId);
        return schedules.stream()
                .map(scheduleMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public DoctorScheduleDto getScheduleById(Long id) {
        log.info("Fetching schedule with ID: {}", id);
        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", id));
        return scheduleMapper.toDto(schedule);
    }

    @Transactional
    public DoctorScheduleDto updateSchedule(Long id, DoctorScheduleDto scheduleDto) {
        log.info("Updating schedule with ID: {}", id);

        DoctorSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoctorSchedule", "id", id));

        scheduleMapper.updateEntityFromDto(scheduleDto, schedule);
        DoctorSchedule updated = scheduleRepository.save(schedule);

        log.info("Schedule updated successfully");
        return scheduleMapper.toDto(updated);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        log.info("Deleting schedule with ID: {}", id);

        if (!scheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("DoctorSchedule", "id", id);
        }

        scheduleRepository.deleteById(id);
        log.info("Schedule deleted successfully");
    }
}
