package com.fpt.edu_trial.entity;

import com.fpt.edu_trial.enums.UniversityCode;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "admission_scores")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdmissionScore extends AbstractEntity<Long> { // Giả sử bạn có một AbstractEntity

    @Enumerated(EnumType.STRING)
    @Column(name = "university_code", nullable = false)
    UniversityCode universityCode;

    @Column(nullable = false)
    Integer year;

    @Column(name = "major_name", nullable = false)
    String majorName;

    @Column(name = "major_code")
    String majorCode;

    @Column(name = "subject_combination", nullable = false)
    String subjectCombination; // Ví dụ: A00, A01, D07

    @Column(nullable = false)
    Float score;

    @Column(columnDefinition = "TEXT")
    String note;
}