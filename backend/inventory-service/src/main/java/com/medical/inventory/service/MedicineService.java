package com.medical.inventory.service;

import com.medical.inventory.dto.*;
import com.medical.inventory.entity.Medicine;
import com.medical.inventory.repository.InventoryStockRepository;
import com.medical.inventory.repository.MedicineRepository;
import com.medical.shared.dto.PageResponse;
import com.medical.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepo;
    private final InventoryStockRepository stockRepo;
    private final InventoryService inventoryService;

    @Transactional(readOnly = true)
    public PageResponse<MedicineDto> getMedicines(String search, String category, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Medicine> result;

        String searchTerm = (search == null || search.isBlank()) ? "" : search;

        if (category != null && !category.isBlank()) {
            try {
                Medicine.Category cat = Medicine.Category.valueOf(category.toUpperCase());
                result = medicineRepo.findByCategoryAndSearchAndActive(cat, searchTerm, pageRequest);
            } catch (IllegalArgumentException e) {
                result = medicineRepo.findBySearchAndActive(searchTerm, pageRequest);
            }
        } else {
            result = medicineRepo.findBySearchAndActive(searchTerm, pageRequest);
        }

        return PageResponse.<MedicineDto>builder()
                .content(result.getContent().stream().map(this::toDto).toList())
                .pageNumber(result.getNumber())
                .pageSize(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .last(result.isLast())
                .first(result.isFirst())
                .build();
    }

    @Transactional(readOnly = true)
    public MedicineDto getMedicineById(Long id) {
        Medicine medicine = findById(id);
        return toDto(medicine);
    }

    @Transactional
    public MedicineDto createMedicine(CreateMedicineRequest request) {
        if (medicineRepo.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Medicine with name '" + request.getName() + "' already exists");
        }

        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .genericName(request.getGenericName())
                .category(Medicine.Category.valueOf(request.getCategory().toUpperCase()))
                .manufacturer(request.getManufacturer())
                .description(request.getDescription())
                .unit(Medicine.Unit.valueOf(request.getUnit().toUpperCase()))
                .unitPrice(request.getUnitPrice())
                .barcode(request.getBarcode())
                .reorderLevel(request.getReorderLevel() != null ? request.getReorderLevel() : 10)
                .active(true)
                .build();

        return toDto(medicineRepo.save(medicine));
    }

    @Transactional
    public MedicineDto updateMedicine(Long id, UpdateMedicineRequest request) {
        Medicine medicine = findById(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            if (!request.getName().equalsIgnoreCase(medicine.getName())
                    && medicineRepo.existsByNameIgnoreCase(request.getName())) {
                throw new IllegalArgumentException("Medicine with name '" + request.getName() + "' already exists");
            }
            medicine.setName(request.getName());
        }
        if (request.getGenericName() != null) medicine.setGenericName(request.getGenericName());
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            medicine.setCategory(Medicine.Category.valueOf(request.getCategory().toUpperCase()));
        }
        if (request.getManufacturer() != null) medicine.setManufacturer(request.getManufacturer());
        if (request.getDescription() != null) medicine.setDescription(request.getDescription());
        if (request.getUnit() != null && !request.getUnit().isBlank()) {
            medicine.setUnit(Medicine.Unit.valueOf(request.getUnit().toUpperCase()));
        }
        if (request.getUnitPrice() != null) medicine.setUnitPrice(request.getUnitPrice());
        if (request.getReorderLevel() != null) medicine.setReorderLevel(request.getReorderLevel());
        if (request.getActive() != null) medicine.setActive(request.getActive());

        return toDto(medicineRepo.save(medicine));
    }

    @Transactional
    public List<MedicineDto> bulkCreate(BulkCreateRequest request) {
        List<MedicineDto> results = new ArrayList<>();
        for (ScannedMedicineDto item : request.getMedicines()) {
            if (item.getName() == null || item.getName().isBlank()) continue;

            Medicine medicine;
            if (medicineRepo.existsByNameIgnoreCase(item.getName())) {
                medicine = medicineRepo.findAll().stream()
                        .filter(m -> m.getName().equalsIgnoreCase(item.getName()))
                        .findFirst()
                        .orElseThrow();
            } else {
                Medicine.Category category = Medicine.Category.OTHER;
                if (item.getCategory() != null) {
                    try { category = Medicine.Category.valueOf(item.getCategory().toUpperCase()); }
                    catch (IllegalArgumentException ignored) {}
                }
                Medicine.Unit unit = Medicine.Unit.TABLET;
                if (item.getUnit() != null) {
                    try { unit = Medicine.Unit.valueOf(item.getUnit().toUpperCase()); }
                    catch (IllegalArgumentException ignored) {}
                }
                medicine = Medicine.builder()
                        .name(item.getName())
                        .genericName(item.getGenericName())
                        .category(category)
                        .manufacturer(item.getManufacturer())
                        .unit(unit)
                        .unitPrice(item.getUnitPrice())
                        .barcode(item.getBarcode())
                        .active(true)
                        .build();
                medicine = medicineRepo.save(medicine);
            }

            if (item.getQuantity() > 0) {
                StockAdjustmentRequest stockReq = new StockAdjustmentRequest();
                stockReq.setMedicineId(medicine.getId());
                stockReq.setTransactionType("PURCHASE");
                stockReq.setQuantity(item.getQuantity());
                stockReq.setNotes("Bulk import from bill scan");
                stockReq.setPerformedBy(request.getPerformedBy());
                inventoryService.adjustStock(stockReq);
            }

            results.add(toDto(medicine));
        }
        return results;
    }

    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = findById(id);
        medicine.setActive(false);
        medicineRepo.save(medicine);
    }

    private Medicine findById(Long id) {
        return medicineRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
    }

    private MedicineDto toDto(Medicine m) {
        Integer totalStock = stockRepo.sumQuantityByMedicineId(m.getId());
        return MedicineDto.builder()
                .id(m.getId())
                .name(m.getName())
                .genericName(m.getGenericName())
                .barcode(m.getBarcode())
                .category(m.getCategory() != null ? m.getCategory().name() : null)
                .manufacturer(m.getManufacturer())
                .description(m.getDescription())
                .unit(m.getUnit() != null ? m.getUnit().name() : null)
                .unitPrice(m.getUnitPrice())
                .reorderLevel(m.getReorderLevel())
                .active(m.getActive())
                .totalStock(totalStock != null ? totalStock : 0)
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
