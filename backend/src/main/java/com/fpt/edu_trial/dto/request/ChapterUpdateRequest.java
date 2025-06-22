package com.fpt.edu_trial.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChapterUpdateRequest {
    @Size(max = 255)
    private String name;

    private String description;

    private Integer orderIndex;
}