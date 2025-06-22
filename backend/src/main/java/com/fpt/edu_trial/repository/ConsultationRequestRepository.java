package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.ConsultationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsultationRequestRepository extends JpaRepository<ConsultationRequest, Long> {
    // Hiện tại chưa cần phương thức truy vấn tùy chỉnh
}
