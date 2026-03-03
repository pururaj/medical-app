package com.medical.inventory.service;

import com.medical.inventory.dto.*;
import com.medical.inventory.entity.InventoryStock;
import com.medical.inventory.entity.Medicine;
import com.medical.inventory.entity.StockTransaction;
import com.medical.inventory.repository.InventoryStockRepository;
import com.medical.inventory.repository.MedicineRepository;
import com.medical.inventory.repository.StockTransactionRepository;
import com.medical.shared.dto.PageResponse;
import com.medical.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryStockRepository stockRepo;
    private final StockTransactionRepository transactionRepo;
    private final MedicineRepository medicineRepo;

    @Transactional(readOnly = true)
    public InventorySummaryDto getSummary() {
        long totalMedicines = medicineRepo.countByActiveTrue();
        List<Long> lowStockMedicineIds = stockRepo.findMedicineIdsWithLowStock();
        long lowStockCount = lowStockMedicineIds.size();
        long outOfStockCount = stockRepo.countOutOfStock();
        long expiringSoonCount = stockRepo.countExpiringSoon(LocalDate.now(), LocalDate.now().plusDays(30));
        long totalStockItems = stockRepo.count();

        return InventorySummaryDto.builder()
                .totalMedicines(totalMedicines)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .expiringSoonCount(expiringSoonCount)
                .totalStockItems(totalStockItems)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryStockDto> getAllStock(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<InventoryStock> result = stockRepo.findAll(pageRequest);
        return PageResponse.<InventoryStockDto>builder()
                .content(result.getContent().stream().map(this::toStockDto).toList())
                .pageNumber(result.getNumber())
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .first(result.isFirst())
                .build();
    }

    @Transactional(readOnly = true)
    public List<MedicineDto> getLowStockMedicines() {
        List<Long> lowStockIds = stockRepo.findMedicineIdsWithLowStock();
        return lowStockIds.stream()
                .map(id -> medicineRepo.findById(id).orElse(null))
                .filter(m -> m != null && m.getActive())
                .map(m -> {
                    Integer totalStock = stockRepo.sumQuantityByMedicineId(m.getId());
                    return MedicineDto.builder()
                            .id(m.getId())
                            .name(m.getName())
                            .genericName(m.getGenericName())
                            .category(m.getCategory() != null ? m.getCategory().name() : null)
                            .manufacturer(m.getManufacturer())
                            .unit(m.getUnit() != null ? m.getUnit().name() : null)
                            .unitPrice(m.getUnitPrice())
                            .reorderLevel(m.getReorderLevel())
                            .active(m.getActive())
                            .totalStock(totalStock != null ? totalStock : 0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryStockDto> getStockForMedicine(Long medicineId) {
        if (!medicineRepo.existsById(medicineId)) {
            throw new ResourceNotFoundException("Medicine not found with id: " + medicineId);
        }
        return stockRepo.findByMedicineId(medicineId).stream()
                .map(this::toStockDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public StockTransactionDto adjustStock(StockAdjustmentRequest request) {
        Medicine medicine = medicineRepo.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + request.getMedicineId()));

        StockTransaction.TransactionType type;
        try {
            type = StockTransaction.TransactionType.valueOf(request.getTransactionType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid transaction type: " + request.getTransactionType());
        }

        Integer currentTotal = stockRepo.sumQuantityByMedicineId(medicine.getId());
        int prevQty = currentTotal != null ? currentTotal : 0;
        int newQty;

        // For PURCHASE and RETURNED: add to stock; for others: subtract
        if (type == StockTransaction.TransactionType.PURCHASE || type == StockTransaction.TransactionType.RETURNED) {
            newQty = prevQty + request.getQuantity();

            // Create or update stock entry
            InventoryStock stock = InventoryStock.builder()
                    .medicine(medicine)
                    .batchNumber(request.getBatchNumber())
                    .currentQuantity(request.getQuantity())
                    .supplier(request.getSupplier())
                    .location(request.getLocation())
                    .receivedDate(LocalDate.now())
                    .build();
            if (request.getExpiryDate() != null && !request.getExpiryDate().isBlank()) {
                stock.setExpiryDate(LocalDate.parse(request.getExpiryDate()));
            }
            stockRepo.save(stock);
        } else {
            // DISPENSED, ADJUSTMENT, EXPIRED: deduct from existing stock
            if (prevQty < request.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock. Available: " + prevQty + ", Requested: " + request.getQuantity());
            }
            newQty = prevQty - request.getQuantity();
            deductFromStock(medicine.getId(), request.getQuantity());
        }

        StockTransaction transaction = StockTransaction.builder()
                .medicine(medicine)
                .transactionType(type)
                .quantity(request.getQuantity())
                .previousQuantity(prevQty)
                .newQuantity(newQty)
                .notes(request.getNotes())
                .performedBy(request.getPerformedBy())
                .build();

        StockTransaction saved = transactionRepo.save(transaction);
        return toTransactionDto(saved);
    }

    @Transactional(readOnly = true)
    public List<StockTransactionDto> getTransactionsForMedicine(Long medicineId) {
        if (!medicineRepo.existsById(medicineId)) {
            throw new ResourceNotFoundException("Medicine not found with id: " + medicineId);
        }
        PageRequest pageRequest = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        return transactionRepo.findByMedicineIdOrderByCreatedAtDesc(medicineId, pageRequest)
                .stream()
                .map(this::toTransactionDto)
                .collect(Collectors.toList());
    }

    private void deductFromStock(Long medicineId, int quantity) {
        List<InventoryStock> stocks = stockRepo.findByMedicineId(medicineId).stream()
                .filter(s -> s.getCurrentQuantity() > 0)
                .sorted((a, b) -> {
                    // FIFO: deduct from oldest first, or soonest expiry
                    if (a.getExpiryDate() != null && b.getExpiryDate() != null) {
                        return a.getExpiryDate().compareTo(b.getExpiryDate());
                    }
                    return a.getCreatedAt().compareTo(b.getCreatedAt());
                })
                .collect(Collectors.toList());

        int remaining = quantity;
        for (InventoryStock stock : stocks) {
            if (remaining <= 0) break;
            int deduct = Math.min(stock.getCurrentQuantity(), remaining);
            stock.setCurrentQuantity(stock.getCurrentQuantity() - deduct);
            stockRepo.save(stock);
            remaining -= deduct;
        }
    }

    private InventoryStockDto toStockDto(InventoryStock s) {
        return InventoryStockDto.builder()
                .id(s.getId())
                .medicineId(s.getMedicine().getId())
                .medicineName(s.getMedicine().getName())
                .medicineCategory(s.getMedicine().getCategory() != null ? s.getMedicine().getCategory().name() : null)
                .batchNumber(s.getBatchNumber())
                .currentQuantity(s.getCurrentQuantity())
                .expiryDate(s.getExpiryDate())
                .supplier(s.getSupplier())
                .receivedDate(s.getReceivedDate())
                .location(s.getLocation())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }

    private StockTransactionDto toTransactionDto(StockTransaction t) {
        return StockTransactionDto.builder()
                .id(t.getId())
                .medicineId(t.getMedicine().getId())
                .medicineName(t.getMedicine().getName())
                .transactionType(t.getTransactionType().name())
                .quantity(t.getQuantity())
                .previousQuantity(t.getPreviousQuantity())
                .newQuantity(t.getNewQuantity())
                .notes(t.getNotes())
                .performedBy(t.getPerformedBy())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
