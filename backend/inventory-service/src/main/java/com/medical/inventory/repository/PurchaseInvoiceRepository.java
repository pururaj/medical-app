package com.medical.inventory.repository;

import com.medical.inventory.entity.PurchaseInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, Long> {

    boolean existsByInvoiceNumber(String invoiceNumber);

    Optional<PurchaseInvoice> findByInvoiceNumber(String invoiceNumber);

    @Query("""
        SELECT p FROM PurchaseInvoice p
        WHERE (:supplierName IS NULL OR LOWER(p.supplierName) LIKE LOWER(CONCAT('%', :supplierName, '%')))
          AND (:from IS NULL OR p.invoiceDate >= :from)
          AND (:to IS NULL OR p.invoiceDate <= :to)
        ORDER BY p.invoiceDate DESC
    """)
    Page<PurchaseInvoice> findByFilters(
            @Param("supplierName") String supplierName,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM PurchaseInvoice p
        WHERE YEAR(p.invoiceDate) = :year AND MONTH(p.invoiceDate) = :month
    """)
    java.util.List<PurchaseInvoice> findByYearAndMonth(@Param("year") int year, @Param("month") int month);
}
