package com.fpt.edu_trial.dto.request;

import com.fpt.edu_trial.enums.UniversityCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdmissionScoreRequest {
    @NotNull(message = "Mã trường không được để trống")
    private UniversityCode universityCode;

    @NotNull(message = "Năm không được để trống")
    private Integer year;

    @NotBlank(message = "Tên ngành không được để trống")
    private String majorName;

    private String majorCode;

    @NotBlank(message = "Tổ hợp môn không được để trống")
    private String subjectCombination;

    @NotNull(message = "Điểm chuẩn không được để trống")
    private Float score;

    private String note;
}