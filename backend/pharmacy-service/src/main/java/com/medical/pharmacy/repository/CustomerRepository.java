package com.medical.pharmacy.repository;

import com.medical.pharmacy.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("SELECT c FROM Customer c WHERE c.active = true AND " +
           "(:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Customer> findByKeywordAndActive(@Param("keyword") String keyword, Pageable pageable);

    long countByActiveTrue();
}
