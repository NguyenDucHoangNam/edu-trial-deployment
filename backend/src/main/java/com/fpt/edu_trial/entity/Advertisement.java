package com.fpt.edu_trial.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Entity
@Table(name = "advertisements")
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Advertisement extends AbstractEntity<Long>{

    @Column(name = "title", nullable = false, length = 100)
    String title;

    @Column(columnDefinition = "TEXT")
    String content;

    @Column(name = "image_url")
    String imageUrl;

    String link;

    Boolean pinned;

    Integer priority;

    Boolean active;

    @Column(name = "start_date")
    LocalDateTime startDate;

    @Column(name = "end_date")
    LocalDateTime endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    University university;


}

