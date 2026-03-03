package com.medical.inventory.repository;

import com.medical.inventory.entity.InventoryStock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, Long> {

    List<InventoryStock> findByMedicineId(Long medicineId);

    Page<InventoryStock> findAll(Pageable pageable);

    @Query("SELECT COALESCE(SUM(s.currentQuantity), 0) FROM InventoryStock s WHERE s.medicine.id = :medicineId")
    Integer sumQuantityByMedicineId(@Param("medicineId") Long medicineId);

    @Query("""
            SELECT s.medicine.id FROM InventoryStock s
            GROUP BY s.medicine.id, s.medicine.reorderLevel
            HAVING COALESCE(SUM(s.currentQuantity), 0) < s.medicine.reorderLevel
            """)
    List<Long> findMedicineIdsWithLowStock();

    @Query(value = """
            SELECT COUNT(*) FROM (
                SELECT medicine_id, COALESCE(SUM(current_quantity), 0) as total
                FROM inventory_stock
                GROUP BY medicine_id
                HAVING COALESCE(SUM(current_quantity), 0) = 0
            ) sub
            """, nativeQuery = true)
    long countOutOfStock();

    @Query("SELECT COUNT(s) FROM InventoryStock s WHERE s.expiryDate IS NOT NULL AND s.expiryDate BETWEEN :today AND :threshold")
    long countExpiringSoon(@Param("today") LocalDate today, @Param("threshold") LocalDate threshold);

    long countByMedicineIdAndCurrentQuantityGreaterThan(Long medicineId, int quantity);
}
