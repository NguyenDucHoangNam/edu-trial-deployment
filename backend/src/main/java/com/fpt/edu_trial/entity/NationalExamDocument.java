package com.fpt.edu_trial.entity;

import com.fpt.edu_trial.enums.DocumentSubject;
import com.fpt.edu_trial.enums.DocumentType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "national_exam_documents")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NationalExamDocument extends AbstractEntity<Long> {

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(nullable = false)
    Integer year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    DocumentSubject subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    DocumentType type;

    @Column(name = "file_url", columnDefinition = "TEXT", nullable = false)
    String fileUrl;

    @Column(name = "file_size")
    String fileSize; // Lưu dưới dạng chuỗi như "1.2MB", "950KB"
}
