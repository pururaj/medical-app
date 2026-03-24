package com.medical.lab.repository;

import com.medical.lab.entity.LabOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabOrderItemRepository extends JpaRepository<LabOrderItem, Long> {

    List<LabOrderItem> findByLabOrderId(Long labOrderId);
}
