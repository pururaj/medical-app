package com.medical.auth.service;

import com.medical.auth.dto.CreateStaffRequest;
import com.medical.auth.dto.StaffDto;
import com.medical.auth.dto.UpdateStaffRequest;
import com.medical.auth.entity.StaffProfile;
import com.medical.auth.entity.User;
import com.medical.auth.repository.StaffProfileRepository;
import com.medical.auth.repository.UserRepository;
import com.medical.shared.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    // Roles that belong to staff (excludes DOCTOR)
    private static final List<String> STAFF_ROLES =
            List.of("RECEPTIONIST", "PHARMACIST", "LAB_TECH", "NURSE", "ADMIN");

    private final StaffProfileRepository staffRepo;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<StaffDto> getAllStaff(String role, String keyword, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        List<String> roles = (role != null && !role.isBlank())
                ? List.of(role.toUpperCase())
                : STAFF_ROLES;

        Page<StaffProfile> resultPage;
        if (keyword != null && !keyword.isBlank()) {
            resultPage = staffRepo.searchByKeywordAndRoles(keyword, roles, pageable);
        } else {
            resultPage = staffRepo.findByUser_RoleIn(roles, pageable);
        }

        return PageResponse.<StaffDto>builder()
                .content(resultPage.getContent().stream().map(this::toDto).toList())
                .pageNumber(resultPage.getNumber())
                .pageSize(resultPage.getSize())
                .totalElements(resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .first(resultPage.isFirst())
                .last(resultPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public StaffDto getStaffById(Long id) {
        StaffProfile profile = staffRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with id: " + id));
        return toDto(profile);
    }

    @Transactional
    public StaffDto createStaff(CreateStaffRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException("Username '" + req.getUsername() + "' is already taken");
        }
        if (staffRepo.findByEmail(req.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email '" + req.getEmail() + "' is already in use");
        }

        User user = User.builder()
                .username(req.getUsername())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole().toUpperCase())
                .enabled(true)
                .build();
        user = userRepository.save(user);

        StaffProfile profile = StaffProfile.builder()
                .user(user)
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phoneNumber(req.getPhoneNumber())
                .department(req.getDepartment())
                .shift(req.getShift() != null ? req.getShift() : "MORNING")
                .qualification(req.getQualification())
                .licenseNumber(req.getLicenseNumber())
                .joiningDate(req.getJoiningDate())
                .active(true)
                .build();
        profile = staffRepo.save(profile);

        return toDto(profile);
    }

    @Transactional
    public StaffDto updateStaff(Long id, UpdateStaffRequest req) {
        StaffProfile profile = staffRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with id: " + id));

        if (req.getFirstName() != null)    profile.setFirstName(req.getFirstName());
        if (req.getLastName() != null)     profile.setLastName(req.getLastName());
        if (req.getPhoneNumber() != null)  profile.setPhoneNumber(req.getPhoneNumber());
        if (req.getDepartment() != null)   profile.setDepartment(req.getDepartment());
        if (req.getShift() != null)        profile.setShift(req.getShift());
        if (req.getQualification() != null) profile.setQualification(req.getQualification());
        if (req.getLicenseNumber() != null) profile.setLicenseNumber(req.getLicenseNumber());
        if (req.getJoiningDate() != null)  profile.setJoiningDate(req.getJoiningDate());

        // Email uniqueness check (skip if unchanged)
        if (req.getEmail() != null && !req.getEmail().equalsIgnoreCase(profile.getEmail())) {
            if (staffRepo.findByEmail(req.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email '" + req.getEmail() + "' is already in use");
            }
            profile.setEmail(req.getEmail());
        }

        // Optional password update
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            User user = profile.getUser();
            user.setPassword(passwordEncoder.encode(req.getPassword()));
            userRepository.save(user);
        }

        return toDto(staffRepo.save(profile));
    }

    @Transactional
    public void deleteStaff(Long id) {
        StaffProfile profile = staffRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with id: " + id));
        profile.setActive(false);
        staffRepo.save(profile);
        User user = profile.getUser();
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Transactional
    public StaffDto toggleActive(Long id) {
        StaffProfile profile = staffRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with id: " + id));
        boolean newActive = !profile.isActive();
        profile.setActive(newActive);
        staffRepo.save(profile);
        User user = profile.getUser();
        user.setEnabled(newActive);
        userRepository.save(user);
        return toDto(profile);
    }

    private StaffDto toDto(StaffProfile p) {
        return StaffDto.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .username(p.getUser().getUsername())
                .role(p.getUser().getRole())
                .enabled(p.getUser().isEnabled())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .email(p.getEmail())
                .phoneNumber(p.getPhoneNumber())
                .department(p.getDepartment())
                .shift(p.getShift())
                .qualification(p.getQualification())
                .licenseNumber(p.getLicenseNumber())
                .joiningDate(p.getJoiningDate())
                .active(p.isActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
