package com.medical.pharmacy.service;

import com.medical.pharmacy.dto.CreateCustomerRequest;
import com.medical.pharmacy.dto.CustomerDto;
import com.medical.pharmacy.dto.UpdateCustomerRequest;
import com.medical.pharmacy.entity.Customer;
import com.medical.pharmacy.repository.CustomerRepository;
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
public class CustomerService {

    private final CustomerRepository customerRepo;

    @Transactional(readOnly = true)
    public PageResponse<CustomerDto> getCustomers(String keyword, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Customer> result = customerRepo.findByKeywordAndActive(keyword, pageable);
        return PageResponse.<CustomerDto>builder()
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
    public CustomerDto getCustomerById(Long id) {
        return toDto(findActive(id));
    }

    @Transactional
    public CustomerDto createCustomer(CreateCustomerRequest req) {
        Customer customer = Customer.builder()
                .name(req.getName())
                .phone(req.getPhone())
                .email(req.getEmail())
                .address(req.getAddress())
                .patientId(req.getPatientId())
                .build();
        return toDto(customerRepo.save(customer));
    }

    @Transactional
    public CustomerDto updateCustomer(Long id, UpdateCustomerRequest req) {
        Customer customer = findActive(id);
        if (req.getName() != null)      customer.setName(req.getName());
        if (req.getPhone() != null)     customer.setPhone(req.getPhone());
        if (req.getEmail() != null)     customer.setEmail(req.getEmail());
        if (req.getAddress() != null)   customer.setAddress(req.getAddress());
        if (req.getPatientId() != null) customer.setPatientId(req.getPatientId());
        if (req.getActive() != null)    customer.setActive(req.getActive());
        return toDto(customerRepo.save(customer));
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = findActive(id);
        customer.setActive(false);
        customerRepo.save(customer);
    }

    private Customer findActive(Long id) {
        Customer c = customerRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        if (!c.getActive()) throw new ResourceNotFoundException("Customer", "id", id);
        return c;
    }

    private CustomerDto toDto(Customer c) {
        return CustomerDto.builder()
                .id(c.getId())
                .name(c.getName())
                .phone(c.getPhone())
                .email(c.getEmail())
                .address(c.getAddress())
                .patientId(c.getPatientId())
                .active(c.getActive())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
