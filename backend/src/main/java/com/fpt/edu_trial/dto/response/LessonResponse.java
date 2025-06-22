package com.fpt.edu_trial.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LessonResponse {
    private Long id;
    private String title;
    private String content;
    private String videoUrl;
    private Integer orderIndex;
    private Long chapterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}