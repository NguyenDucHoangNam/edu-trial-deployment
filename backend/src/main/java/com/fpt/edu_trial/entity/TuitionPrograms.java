package com.fpt.edu_trial.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Entity
@Table(name = "tuitionPrograms")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TuitionPrograms extends AbstractEntity<Long> {

    @Column(name = "program_name")
    String programName;

    @Column(name = "fee_amount")
    BigDecimal feeAmount;

    String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id")
    University university;
}
