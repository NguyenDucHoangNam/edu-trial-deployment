package com.fpt.edu_trial.dto.request;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
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
public class TuitionProgramUpdateRequest {

    @Size(max = 255, message = "Tên chương trình không được vượt quá 255 ký tự")
    private String programName; // Tên mới (tùy chọn)

    @DecimalMin(value = "0.0", inclusive = false, message = "Mức học phí phải lớn hơn 0")
    @Digits(integer = 10, fraction = 2, message = "Mức học phí không hợp lệ")
    private BigDecimal feeAmount; // Mức học phí mới (tùy chọn)

    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description; // Mô tả mới (tùy chọn)
}
