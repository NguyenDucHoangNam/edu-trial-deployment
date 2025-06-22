package com.fpt.edu_trial.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssociateFacultyRequest {
    @NotBlank(message = "Tên khoa không được để trống")
    private String name;
}