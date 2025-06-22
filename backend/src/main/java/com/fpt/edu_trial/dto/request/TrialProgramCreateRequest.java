package com.fpt.edu_trial.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class TrialProgramCreateRequest {

    @NotBlank(message = "Tên chương trình không được để trống")
    @Size(max = 255, message = "Tên không được vượt quá 255 ký tự")
    private String name;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    // Ảnh bìa là tùy chọn khi tạo
    private MultipartFile coverImageFile;
}
