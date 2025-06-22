package com.fpt.edu_trial.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class FacultyCreateRequest {
    @NotBlank(message = "Tên khoa không được để trống")
    private String name;
    private String description;
    private MultipartFile imageFile;
}