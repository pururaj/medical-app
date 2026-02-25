package com.medical.doctor.mapper;

import com.medical.doctor.dto.DoctorDto;
import com.medical.doctor.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DoctorMapper {

    DoctorDto toDto(Doctor doctor);

    Doctor toEntity(DoctorDto dto);

    void updateEntityFromDto(DoctorDto dto, @MappingTarget Doctor doctor);
}
