package com.fpt.edu_trial.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TrialProgramResponse {
    private Long id;
    private String name;
    private String description;
    private String coverImageUrl;
    private Long universityId;
    private String universityName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
