package com.fpt.edu_trial.dto.response;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TuitionProgramResponse {
    private Long id;
    private String programName;

    @JsonFormat(shape = JsonFormat.Shape.STRING) // Hiển thị BigDecimal dưới dạng chuỗi để tránh mất độ chính xác
    private BigDecimal feeAmount;

    private String description;
    private Long universityId;
    private String universityName;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}
