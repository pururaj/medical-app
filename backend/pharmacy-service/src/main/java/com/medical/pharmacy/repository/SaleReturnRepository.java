package com.medical.pharmacy.repository;

import com.medical.pharmacy.entity.SaleReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleReturnRepository extends JpaRepository<SaleReturn, Long> {
    Page<SaleReturn> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<SaleReturn> findByOriginalSaleId(Long saleId);
    long countByOriginalSaleId(Long saleId);

    @Query("SELECT r FROM SaleReturn r WHERE r.createdAt >= :start AND r.createdAt < :end")
    List<SaleReturn> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
