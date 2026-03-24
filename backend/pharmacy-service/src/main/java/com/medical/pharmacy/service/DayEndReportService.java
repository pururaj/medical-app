package com.medical.pharmacy.service;

import com.medical.pharmacy.dto.DayEndReportDto;
import com.medical.pharmacy.dto.DayEndReportDto.*;
import com.medical.pharmacy.entity.Sale;
import com.medical.pharmacy.entity.SaleItem;
import com.medical.pharmacy.entity.SaleReturn;
import com.medical.pharmacy.repository.SaleRepository;
import com.medical.pharmacy.repository.SaleReturnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DayEndReportService {

    private final SaleRepository saleRepo;
    private final SaleReturnRepository returnRepo;

    @Transactional(readOnly = true)
    public DayEndReportDto generateReport(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end   = date.plusDays(1).atStartOfDay();

        List<Sale>       sales   = saleRepo.findSalesWithItemsForDateRange(start, end);
        List<SaleReturn> returns = returnRepo.findByDateRange(start, end);

        // ---- Sales summary ----
        BigDecimal totalRevenue = sales.stream()
                .map(Sale::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // ---- Payment breakdown ----
        Map<String, PaymentBreakdownDto> paymentBreakdown = new LinkedHashMap<>();
        Map<String, List<Sale>> byMethod = sales.stream()
                .collect(Collectors.groupingBy(s -> s.getPaymentMethod().name()));
        byMethod.forEach((method, list) -> {
            BigDecimal amount = list.stream().map(Sale::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            paymentBreakdown.put(method, PaymentBreakdownDto.builder()
                    .count(list.size())
                    .amount(amount)
                    .build());
        });

        // ---- Returns & exchanges ----
        long totalReturnsCount = returns.stream()
                .filter(r -> r.getTransactionType() == com.medical.pharmacy.entity.SaleReturn.TransactionType.RETURN)
                .count();
        BigDecimal totalRefundAmount = returns.stream()
                .map(SaleReturn::getTotalRefundAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalExchangesCount = returns.stream()
                .filter(r -> r.getTransactionType() == com.medical.pharmacy.entity.SaleReturn.TransactionType.EXCHANGE)
                .count();
        BigDecimal totalExchangeAmount = returns.stream()
                .map(SaleReturn::getExchangeAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netRevenue = totalRevenue.subtract(totalRefundAmount);

        // ---- Top medicines ----
        Map<String, long[]> medicineAgg = new LinkedHashMap<>(); // name -> [qty, amount*100]
        for (Sale sale : sales) {
            for (SaleItem item : sale.getItems()) {
                medicineAgg.compute(item.getMedicineName(), (name, arr) -> {
                    if (arr == null) arr = new long[]{0, 0};
                    arr[0] += item.getQuantity();
                    arr[1] += item.getLineTotal().multiply(BigDecimal.valueOf(100)).longValue();
                    return arr;
                });
            }
        }
        List<TopMedicineDto> topMedicines = medicineAgg.entrySet().stream()
                .map(e -> TopMedicineDto.builder()
                        .medicineName(e.getKey())
                        .totalQuantity(e.getValue()[0])
                        .totalAmount(BigDecimal.valueOf(e.getValue()[1]).divide(BigDecimal.valueOf(100)))
                        .build())
                .sorted(Comparator.comparingLong(TopMedicineDto::getTotalQuantity).reversed())
                .limit(10)
                .toList();

        // ---- Hourly breakdown ----
        Map<Integer, List<Sale>> byHour = sales.stream()
                .collect(Collectors.groupingBy(s -> s.getCreatedAt().getHour()));
        List<HourlySalesDto> hourlySales = new ArrayList<>();
        for (int h = 0; h < 24; h++) {
            List<Sale> hourSales = byHour.getOrDefault(h, List.of());
            if (!hourSales.isEmpty()) {
                BigDecimal hourRevenue = hourSales.stream()
                        .map(Sale::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                hourlySales.add(HourlySalesDto.builder()
                        .hour(h)
                        .label(String.format("%02d:00", h))
                        .salesCount(hourSales.size())
                        .revenue(hourRevenue)
                        .build());
            }
        }

        return DayEndReportDto.builder()
                .date(date.format(DateTimeFormatter.ISO_LOCAL_DATE))
                .generatedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .totalSalesCount(sales.size())
                .totalRevenue(totalRevenue)
                .paymentBreakdown(paymentBreakdown)
                .totalReturnsCount(totalReturnsCount)
                .totalRefundAmount(totalRefundAmount)
                .totalExchangesCount(totalExchangesCount)
                .totalExchangeAmount(totalExchangeAmount)
                .netRevenue(netRevenue)
                .topMedicines(topMedicines)
                .hourlySales(hourlySales)
                .build();
    }
}
