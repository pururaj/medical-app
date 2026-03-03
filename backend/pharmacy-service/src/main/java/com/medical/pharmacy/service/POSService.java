package com.medical.pharmacy.service;

import com.medical.pharmacy.dto.POSSummaryDto;
import com.medical.pharmacy.repository.CustomerRepository;
import com.medical.pharmacy.repository.SaleRepository;
import com.medical.pharmacy.repository.SaleReturnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class POSService {

    private final SaleRepository saleRepo;
    private final CustomerRepository customerRepo;
    private final SaleReturnRepository returnRepo;

    @Transactional(readOnly = true)
    public POSSummaryDto getSummary() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = startOfDay.plusDays(1);

        long todayCount         = saleRepo.countTodaySales(startOfDay, endOfDay);
        BigDecimal todayRevenue = saleRepo.sumTodayRevenue(startOfDay, endOfDay);
        long totalCustomers     = customerRepo.countByActiveTrue();
        long pendingReturns     = returnRepo.count(); // total returns processed (can be filtered further)

        return POSSummaryDto.builder()
                .todaySalesCount(todayCount)
                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .totalCustomers(totalCustomers)
                .pendingReturnsCount(pendingReturns)
                .build();
    }
}
