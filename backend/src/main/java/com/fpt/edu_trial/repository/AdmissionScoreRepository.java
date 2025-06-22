package com.fpt.edu_trial.repository;

import com.fpt.edu_trial.entity.AdmissionScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface AdmissionScoreRepository extends JpaRepository<AdmissionScore, Long>, JpaSpecificationExecutor<AdmissionScore> {
}