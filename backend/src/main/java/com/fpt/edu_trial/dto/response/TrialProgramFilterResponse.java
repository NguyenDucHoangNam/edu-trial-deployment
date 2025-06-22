package com.fpt.edu_trial.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;

// DTO này được thiết kế đặc biệt cho trang danh sách khóa học thử
@Data
@NoArgsConstructor
public class TrialProgramFilterResponse {
    private Long id;
    private String name;
    private String description;
    private String coverImageUrl;
    private UniversityInfo university; // Thông tin về trường chứa khóa học

    // Lớp nội bộ để chứa thông tin gọn nhẹ của trường đại học
    @Data
    @NoArgsConstructor
    public static class UniversityInfo {
        private Long id;
        private String name;
        private String logoUrl;
    }
}
