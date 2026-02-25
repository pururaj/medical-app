package com.medical.appointment.mapper;

import com.medical.appointment.dto.DoctorScheduleDto;
import com.medical.appointment.entity.DoctorSchedule;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DoctorScheduleMapper {

    DoctorScheduleDto toDto(DoctorSchedule schedule);

    DoctorSchedule toEntity(DoctorScheduleDto scheduleDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(DoctorScheduleDto scheduleDto, @MappingTarget DoctorSchedule schedule);
}
