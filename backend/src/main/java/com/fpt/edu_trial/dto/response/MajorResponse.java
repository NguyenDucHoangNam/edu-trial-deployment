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
public class MajorResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Long facultyId;
    private String facultyName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
