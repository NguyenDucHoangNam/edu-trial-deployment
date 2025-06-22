package com.fpt.edu_trial.entity;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "reviews")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Review extends AbstractEntity<Long> {

    @Column(columnDefinition = "TEXT")
    String content;

    Integer rating; // 1 - 5

    @ManyToOne
    @JoinColumn(name = "trial_program_id")
    TrialProgram trialProgram;

    @ManyToOne
    @JoinColumn(name = "lesson_id")
    Lesson lesson;

}