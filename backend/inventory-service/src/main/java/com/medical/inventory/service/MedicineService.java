package com.medical.inventory.service;

import com.medical.inventory.dto.CreateMedicineRequest;
import com.medical.inventory.dto.MedicineDto;
import com.medical.inventory.dto.UpdateMedicineRequest;
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

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepo;
    private final InventoryStockRepository stockRepo;

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
