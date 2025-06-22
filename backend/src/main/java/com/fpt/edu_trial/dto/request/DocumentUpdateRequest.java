package com.fpt.edu_trial.dto.request;

import com.fpt.edu_trial.enums.DocumentSubject;
import com.fpt.edu_trial.enums.DocumentType;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class DocumentUpdateRequest {
    // Tất cả các trường đều là tùy chọn khi cập nhật
    private String title;
    private String description;
    private Integer year;
    private DocumentSubject subject;
    private DocumentType type;

    // Tùy chọn để thay thế file hiện tại
    private MultipartFile documentFile;
}