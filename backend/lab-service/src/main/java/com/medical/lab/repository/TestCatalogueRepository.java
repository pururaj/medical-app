package com.medical.lab.repository;

import com.medical.lab.entity.TestCatalogue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TestCatalogueRepository extends JpaRepository<TestCatalogue, Long>,
        JpaSpecificationExecutor<TestCatalogue> {

    boolean existsByTestCode(String testCode);
}
