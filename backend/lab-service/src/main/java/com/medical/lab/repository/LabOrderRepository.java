package com.medical.lab.repository;

import com.medical.lab.entity.LabOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface LabOrderRepository extends JpaRepository<LabOrder, Long>,
        JpaSpecificationExecutor<LabOrder> {

    @Query("SELECT COUNT(o) FROM LabOrder o WHERE o.createdAt >= :start AND o.createdAt < :end")
    long countTodayOrders(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM LabOrder o WHERE o.status = 'PENDING'")
    long countPendingSamples();

    @Query("SELECT COUNT(o) FROM LabOrder o WHERE o.status = 'IN_PROGRESS'")
    long countInProgress();

    @Query("SELECT COUNT(o) FROM LabOrder o WHERE o.status = 'COMPLETED' AND o.updatedAt >= :start AND o.updatedAt < :end")
    long countCompletedToday(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
