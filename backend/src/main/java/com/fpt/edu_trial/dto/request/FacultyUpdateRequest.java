package com.fpt.edu_trial.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class FacultyUpdateRequest {
    private String name;
    private String description;
    private MultipartFile imageFile;
    private Boolean removeCurrentImage = false;
}