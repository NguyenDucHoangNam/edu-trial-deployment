package com.fpt.edu_trial.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "trial_programs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TrialProgram extends AbstractEntity<Long> {
    String name;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "cover_image_url")
    String coverImageUrl;

    @OneToMany(mappedBy = "trialProgram", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Chapter> chapters = new HashSet<>();

    @OneToMany(mappedBy = "trialProgram", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Review> reviews;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    University university;
}