package com.fpt.edu_trial.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipProgramCreateRequest {

    @NotBlank(message = "Tên chương trình học bổng không được để trống")
    @Size(max = 255, message = "Tên không được vượt quá 255 ký tự")
    private String name;

    @NotBlank(message = "Mô tả tiêu chí không được để trống")
    @Size(max = 2000, message = "Mô tả tiêu chí không được vượt quá 2000 ký tự")
    private String criteriaDescription;

    @NotBlank(message = "Mô tả giá trị học bổng không được để trống")
    @Size(max = 1000, message = "Mô tả giá trị không được vượt quá 1000 ký tự")
    private String valueDescription;
}