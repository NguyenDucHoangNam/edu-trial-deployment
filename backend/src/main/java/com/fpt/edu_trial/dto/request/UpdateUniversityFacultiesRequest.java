package com.fpt.edu_trial.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class UpdateUniversityFacultiesRequest {
    @NotEmpty(message = "Danh sách ID khoa không được để trống.")
    private List<Long> facultyIds;
}