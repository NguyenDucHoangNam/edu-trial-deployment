package com.fpt.edu_trial.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "universityEvent")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UniversityEvent extends AbstractEntity<Long>{

    @Column(nullable = false)
    String title;

    @Column(nullable = false)
    LocalDateTime date;

    String description;

    @Column(nullable = false)
    String location;

    @Column(name = "image_url")
    String imageUrl;

    String link;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    University university;
}
