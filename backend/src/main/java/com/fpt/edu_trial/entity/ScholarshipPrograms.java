package com.fpt.edu_trial.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "scholarshipPrograms")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScholarshipPrograms extends AbstractEntity<Long>{
    String name;

    @Column(name = "criteria_description")
    String criteriaDescription;

    @Column(name = "value_description")
    String valueDescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    University university;


}
