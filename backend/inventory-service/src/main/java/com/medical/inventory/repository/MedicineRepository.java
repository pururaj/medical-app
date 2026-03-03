package com.medical.inventory.repository;

import com.medical.inventory.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    boolean existsByNameIgnoreCase(String name);

    @Query("""
            SELECT m FROM Medicine m
            WHERE m.active = true
            AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Medicine> findBySearchAndActive(@Param("search") String search, Pageable pageable);

    @Query("""
            SELECT m FROM Medicine m
            WHERE m.active = true
            AND m.category = :category
            AND (LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Medicine> findByCategoryAndSearchAndActive(@Param("category") Medicine.Category category,
                                                     @Param("search") String search,
                                                     Pageable pageable);

    Page<Medicine> findByActiveTrue(Pageable pageable);

    long countByActiveTrue();
}
