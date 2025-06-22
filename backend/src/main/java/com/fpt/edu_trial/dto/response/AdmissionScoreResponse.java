package com.fpt.edu_trial.dto.response;

import com.fpt.edu_trial.enums.UniversityCode;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdmissionScoreResponse {
    private Long id;
    private UniversityCode universityCode;
    private String universityName; // Thêm tên trường để hiển thị
    private Integer year;
    private String majorName;
    private String majorCode;
    private String subjectCombination;
    private Float score;
    private String note;
    private LocalDateTime createdAt;
}