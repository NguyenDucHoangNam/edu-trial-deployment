package com.fpt.edu_trial.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScholarshipProgramResponse {
    private Long id;
    private String name;
    private String criteriaDescription;
    private String valueDescription;
    private Long universityId;
    private String universityName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}