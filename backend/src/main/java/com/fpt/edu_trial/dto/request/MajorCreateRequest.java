package com.fpt.edu_trial.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MajorCreateRequest {

    // SỬA ĐỔI: Chuyển từ Enum MajorName sang String và thêm @NotBlank
    @NotBlank(message = "Tên ngành không được để trống")
    @Size(max = 255, message = "Tên ngành không được vượt quá 255 ký tự")
    private String name;

    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description;

    @NotNull(message = "ID Khoa không được để trống")
    private Long facultyId;

    private MultipartFile imageFile;
}