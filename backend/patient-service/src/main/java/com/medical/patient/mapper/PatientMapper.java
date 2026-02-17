package com.medical.patient.mapper;

import com.medical.patient.dto.PatientDto;
import com.medical.patient.entity.Patient;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientMapper {

    PatientDto toDto(Patient patient);

    Patient toEntity(PatientDto patientDto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(PatientDto patientDto, @MappingTarget Patient patient);
}
