package com.fpt.edu_trial.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "lessons")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Lesson extends AbstractEntity<Long> {

    String title;

    @Column(columnDefinition = "TEXT")
    String content;

    @Column(name = "video_url")
    String videoUrl;

    @Column(name = "order_index")
    Integer orderIndex;

    @ManyToOne
    @JoinColumn(name = "chapter_id")
    Chapter chapter;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<Review> reviews = new HashSet<>();
}
