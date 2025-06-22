package com.fpt.edu_trial.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChapterCreateRequest {
    @NotBlank(message = "Tên chương không được để trống")
    @Size(max = 255)
    private String name;

    private String description;

    @NotNull(message = "Thứ tự chương là bắt buộc")
    private Integer orderIndex;
}

