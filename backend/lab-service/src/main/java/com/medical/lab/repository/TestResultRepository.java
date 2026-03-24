package com.medical.lab.repository;

import com.medical.lab.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {

    List<TestResult> findByLabOrderId(Long labOrderId);

    long countByLabOrderId(Long labOrderId);

    long countByLabOrderIdAndIsAbnormalTrue(Long labOrderId);

    long countByIsAbnormalTrue();
}
