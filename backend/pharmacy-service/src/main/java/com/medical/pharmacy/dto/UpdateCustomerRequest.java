package com.medical.pharmacy.dto;

import lombok.Data;

@Data
public class UpdateCustomerRequest {
    private String name;
    private String phone;
    private String email;
    private String address;
    private Long patientId;
    private Boolean active;
}
