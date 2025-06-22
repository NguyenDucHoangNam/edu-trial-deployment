package com.fpt.edu_trial.dto.request;

import com.fpt.edu_trial.enums.DocumentSubject;
import com.fpt.edu_trial.enums.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DocumentCreateRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    private String description;
    @NotNull(message = "Năm không được để trống")
    private Integer year;
    @NotNull(message = "Môn học không được để trống")
    private DocumentSubject subject;
    @NotNull(message = "Loại tài liệu không được để trống")
    private DocumentType type;
    @NotNull(message = "File tài liệu là bắt buộc")
    private MultipartFile documentFile;
}
