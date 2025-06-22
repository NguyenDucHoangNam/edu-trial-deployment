package com.fpt.edu_trial.entity;

import com.fpt.edu_trial.enums.ConsultationStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "consultation_requests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConsultationRequest extends AbstractEntity<Long> {

    @Column(nullable = false)
    String fullName;

    @Column(nullable = false)
    String email;

    @Column(nullable = false)
    String phone;

    @Column(columnDefinition = "TEXT")
    String aspiration; // Nguyện vọng cần tư vấn

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ConsultationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trial_program_id", nullable = false)
    TrialProgram trialProgram;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id", nullable = false)
    University university;

    // Người dùng đã đăng ký, có thể null nếu là khách
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;
}
