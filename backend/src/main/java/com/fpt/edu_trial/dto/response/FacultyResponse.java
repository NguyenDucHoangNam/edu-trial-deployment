package com.fpt.edu_trial.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyResponse {
    private Long id;
    private String name;
    private String imageUrl;
    private String description; // Bạn có thể thêm lại trường này nếu cần

    private Long universityId; // <-- THÊM TRƯỜNG NÀY
    private List<MajorResponse> majors;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}