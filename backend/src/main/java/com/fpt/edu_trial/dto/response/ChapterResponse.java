package com.fpt.edu_trial.dto.response;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChapterResponse {
    private Long id;
    private String name;
    private String description;
    private Integer orderIndex;
    private Long trialProgramId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}