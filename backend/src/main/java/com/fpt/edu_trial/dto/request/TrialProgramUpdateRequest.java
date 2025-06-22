package com.fpt.edu_trial.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class TrialProgramUpdateRequest {

    @Size(max = 255, message = "Tên không được vượt quá 255 ký tự")
    private String name;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    // Tùy chọn để tải lên ảnh bìa mới
    private MultipartFile coverImageFile;

    // Tùy chọn để xóa ảnh bìa hiện tại
    private Boolean removeCurrentImage = false;
}
