package com.fpt.edu_trial.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TuitionProgramCreateRequest {

    @NotBlank(message = "Tên chương trình học phí không được để trống")
    @Size(max = 255, message = "Tên chương trình không được vượt quá 255 ký tự")
    private String programName;

    @NotNull(message = "Mức học phí không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Mức học phí phải lớn hơn 0")
    @Digits(integer = 10, fraction = 2, message = "Mức học phí không hợp lệ") // Ví dụ: tối đa 10 chữ số phần nguyên, 2 chữ số phần thập phân
    private BigDecimal feeAmount;

    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description;
}