package com.fpt.edu_trial.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "major")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Major extends AbstractEntity<Long> {
    @Column(name = "image_url")
    String imageUrl;

    @Column(name = "name", nullable = false)
    private String name; // <-- QUAY LẠI DÙNG STRING

    String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id", nullable = false) // Sẽ tạo cột university_id trong bảng faculties
    private University university;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    Faculty faculty;

}
