package com.medical.lab.service;

import com.medical.lab.dto.LabDashboardDto;
import com.medical.lab.repository.LabOrderRepository;
import com.medical.lab.repository.TestCatalogueRepository;
import com.medical.lab.repository.TestResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LabDashboardService {

    private final LabOrderRepository orderRepo;
    private final TestResultRepository resultRepo;
    private final TestCatalogueRepository catalogueRepo;

    @Transactional(readOnly = true)
    public LabDashboardDto getSummary() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        long todayOrders = orderRepo.countTodayOrders(startOfDay, endOfDay);
        long pendingSamples = orderRepo.countPendingSamples();
        long inProgress = orderRepo.countInProgress();
        long completedToday = orderRepo.countCompletedToday(startOfDay, endOfDay);
        long abnormalResults = resultRepo.countByIsAbnormalTrue();
        long totalCatalogueTests = catalogueRepo.count();

        return LabDashboardDto.builder()
                .todayOrders(todayOrders)
                .pendingSamples(pendingSamples)
                .inProgress(inProgress)
                .completedToday(completedToday)
                .abnormalResults(abnormalResults)
                .totalCatalogueTests(totalCatalogueTests)
                .build();
    }
}
