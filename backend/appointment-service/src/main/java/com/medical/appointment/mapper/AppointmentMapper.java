package com.medical.appointment.mapper;

import com.medical.appointment.dto.AppointmentDto;
import com.medical.appointment.entity.Appointment;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AppointmentMapper {

    AppointmentDto toDto(Appointment appointment);

    Appointment toEntity(AppointmentDto appointmentDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(AppointmentDto appointmentDto, @MappingTarget Appointment appointment);
}
