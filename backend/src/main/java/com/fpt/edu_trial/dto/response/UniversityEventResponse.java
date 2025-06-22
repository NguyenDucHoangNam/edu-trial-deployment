package com.fpt.edu_trial.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversityEventResponse {
    private Long id;
    private String title;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime date;

    private String description;
    private String location;
    private String imageUrl;
    private String link;
    private Long universityId;
    private String universityName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

