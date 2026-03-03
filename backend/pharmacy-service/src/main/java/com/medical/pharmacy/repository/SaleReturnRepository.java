package com.medical.pharmacy.repository;

import com.medical.pharmacy.entity.SaleReturn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleReturnRepository extends JpaRepository<SaleReturn, Long> {
    Page<SaleReturn> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<SaleReturn> findByOriginalSaleId(Long saleId);
    long countByOriginalSaleId(Long saleId);
}
