package com.medical.inventory.repository;

import com.medical.inventory.entity.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    Page<StockTransaction> findByMedicineIdOrderByCreatedAtDesc(Long medicineId, Pageable pageable);
}
