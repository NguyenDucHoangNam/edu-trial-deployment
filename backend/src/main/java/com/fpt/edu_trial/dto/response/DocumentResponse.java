package com.fpt.edu_trial.dto.response;

import com.fpt.edu_trial.enums.DocumentSubject;
import com.fpt.edu_trial.enums.DocumentType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DocumentResponse {
    private Long id;
    private String title;
    private String description;
    private Integer year;
    private DocumentSubject subject;
    private DocumentType type;
    private String fileUrl;
    private String fileSize;
    private LocalDateTime createdAt;
}
