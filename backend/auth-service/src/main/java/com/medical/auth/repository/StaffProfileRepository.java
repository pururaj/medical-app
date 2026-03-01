package com.medical.auth.repository;

import com.medical.auth.entity.StaffProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffProfileRepository extends JpaRepository<StaffProfile, Long> {

    Optional<StaffProfile> findByUserId(Long userId);

    Optional<StaffProfile> findByEmail(String email);

    Page<StaffProfile> findByUser_RoleIn(List<String> roles, Pageable pageable);

    @Query("""
        SELECT s FROM StaffProfile s
        WHERE s.user.role IN :roles
          AND (
            LOWER(s.firstName)  LIKE LOWER(CONCAT('%', :kw, '%')) OR
            LOWER(s.lastName)   LIKE LOWER(CONCAT('%', :kw, '%')) OR
            LOWER(s.email)      LIKE LOWER(CONCAT('%', :kw, '%'))
          )
        """)
    Page<StaffProfile> searchByKeywordAndRoles(
            @Param("kw") String keyword,
            @Param("roles") List<String> roles,
            Pageable pageable);
}
