package com.fpt.edu_trial.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "chapters")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Chapter extends AbstractEntity<Long> {

    String name;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(name = "order_index")
    Integer orderIndex;

    @ManyToOne
    @JoinColumn(name = "trial_program_id")
    TrialProgram trialProgram;

    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Lesson> lessons = new HashSet<>();
}
